import asyncio
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import httpx
from pydantic import ValidationError

from backend.auth import CurrentUser
from backend.main import app
from backend.routes import ai as ai_routes
from backend.routes.ai import AskRequest, UNAVAILABLE_MESSAGE
from backend.services import poe_assistant


class FakeQuery:
    def __init__(self, rows):
        self.rows = rows
        self.filters = []

    def eq(self, column, value):
        self.filters.append((column, value))
        return self

    def order(self, *_args, **_kwargs):
        return self

    def limit(self, *_args):
        return self

    def execute(self):
        return SimpleNamespace(data=self.rows)


class FakeResponse:
    def raise_for_status(self):
        return None

    def json(self):
        return {"choices": [{"message": {"content": "Hello from Poe."}}]}


class FakeClient:
    def __init__(self, **_kwargs):
        self.request = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return None

    async def post(self, url, **kwargs):
        self.request = (url, kwargs)
        return FakeResponse()


class PoeAssistantTests(unittest.IsolatedAsyncioTestCase):
    async def test_ask_sends_configured_poe_request_and_history(self):
        client = FakeClient()
        settings = SimpleNamespace(
            poe_api_key="server-only-test-key",
            poe_model="assistant",
            poe_timeout_seconds=30,
        )
        with (
            patch.object(poe_assistant, "get_settings", return_value=settings),
            patch.object(poe_assistant, "build_campus_context", return_value=({}, [])),
            patch.object(poe_assistant.httpx, "AsyncClient", return_value=client),
        ):
            answer, sources = await poe_assistant.answer_with_poe(
                "How do I find my timetable?",
                [{"role": "user", "content": "Hello"}],
                CurrentUser(id="student-1", role="student", email=None, name=None),
            )

        self.assertEqual(answer, "Hello from Poe.")
        self.assertEqual(sources, [])
        self.assertEqual(client.request[0], poe_assistant.POE_API_URL)
        self.assertEqual(
            client.request[1]["headers"]["Authorization"],
            "Bearer server-only-test-key",
        )
        self.assertEqual(client.request[1]["json"]["model"], "assistant")
        self.assertEqual(client.request[1]["json"]["messages"][1]["content"], "Hello")

    async def test_missing_poe_key_fails_without_making_a_request(self):
        settings = SimpleNamespace(poe_api_key=None)
        with (
            patch.object(poe_assistant, "get_settings", return_value=settings),
            patch.object(poe_assistant.httpx, "AsyncClient") as client,
        ):
            with self.assertRaises(poe_assistant.PoeAssistantUnavailable):
                await poe_assistant.answer_with_poe(
                    "Hello",
                    [],
                    CurrentUser(id="student-1", role="student", email=None, name=None),
                )

        client.assert_not_called()

    async def test_poe_timeout_returns_a_safe_unavailable_error(self):
        settings = SimpleNamespace(
            poe_api_key="server-only-test-key",
            poe_model="assistant",
            poe_timeout_seconds=30,
        )
        client = FakeClient()
        client.post = AsyncMock(side_effect=httpx.TimeoutException("provider detail"))
        with (
            patch.object(poe_assistant, "get_settings", return_value=settings),
            patch.object(poe_assistant, "build_campus_context", return_value=({}, [])),
            patch.object(poe_assistant.httpx, "AsyncClient", return_value=client),
        ):
            with self.assertRaises(poe_assistant.PoeAssistantUnavailable):
                await poe_assistant.answer_with_poe(
                    "Hello",
                    [],
                    CurrentUser(id="student-1", role="student", email=None, name=None),
                )

    async def test_student_attendance_context_is_filtered_to_caller(self):
        query = FakeQuery([{"total_classes": 20, "present_classes": 17}])
        user = CurrentUser(id="student-1", role="student", email=None, name=None)
        with (
            patch.object(poe_assistant.db_helpers, "filtered_query", return_value=query),
            patch.object(
                poe_assistant,
                "get_settings",
                return_value=SimpleNamespace(attendance_required=75.0),
            ),
        ):
            context, sources = await asyncio.to_thread(
                poe_assistant.build_campus_context,
                "What is my attendance?",
                user,
            )

        self.assertEqual(query.filters, [("student_id", "student-1")])
        self.assertEqual(context["attendance"]["percentage"], 85.0)
        self.assertIn("your attendance records", sources)

    async def test_admin_issue_context_contains_only_aggregates(self):
        query = FakeQuery([
            {"category": "Water", "priority": "High", "status": "Submitted"},
            {"category": "Water", "priority": "Low", "status": "Resolved"},
        ])
        with patch.object(poe_assistant.db_helpers, "filtered_query", return_value=query):
            context, sources = await asyncio.to_thread(
                poe_assistant.build_campus_context,
                "Summarize campus issues",
                CurrentUser(id="admin-1", role="admin", email=None, name=None),
            )

        self.assertEqual(context["complaint_summary"]["total"], 2)
        self.assertEqual(context["complaint_summary"]["by_category"], {"Water": 2})
        self.assertNotIn("student_id", context["complaint_summary"])
        self.assertIn("aggregate complaint statistics", sources)

    async def test_sample_student_and_admin_questions_use_relevant_context(self):
        cases = [
            ("What is my attendance?", "student", "attendance"),
            ("What is the status of my complaint?", "student", "complaints"),
            ("How is my document request going?", "student", "requests"),
            ("What is today's mess menu?", "student", "mess_menu"),
            ("Summarize current campus issues", "admin", "complaints"),
            ("How many requests need review?", "admin", "requests"),
            ("What is this week's menu?", "admin", "mess_menu"),
        ]

        for question, role, expected_table in cases:
            user = CurrentUser(id="caller-1", role=role, email=None, name=None)
            observed_tables = []

            def fake_filtered_query(table, *_args):
                observed_tables.append(table)
                query = FakeQuery([{"day": "Monday", "status": "Submitted"}])
                observed_queries.append((table, query))
                return query

            observed_queries = []
            with (
                patch.object(poe_assistant.db_helpers, "filtered_query", side_effect=fake_filtered_query),
                patch.object(
                    poe_assistant,
                    "get_settings",
                    return_value=SimpleNamespace(attendance_required=75.0),
                ),
            ):
                context, _sources = await asyncio.to_thread(
                    poe_assistant.build_campus_context,
                    question,
                    user,
                )

            self.assertIn(expected_table, observed_tables, question)
            self.assertTrue(context, question)
            if role == "student":
                self.assertTrue(all(table in {"attendance", "complaints", "requests", "mess_menu"} for table in observed_tables))
                for table, query in observed_queries:
                    if table != "mess_menu":
                        self.assertIn(("student_id", user.id), query.filters, question)

    def test_question_validation_rejects_blank_and_oversized_inputs(self):
        with self.assertRaises(ValidationError):
            AskRequest(question="   ")
        with self.assertRaises(ValidationError):
            AskRequest(question="x" * 2_001)

    def test_question_validation_rejects_excessive_history(self):
        history = [{"role": "user", "content": "x" * 1_000}] * 9
        with self.assertRaises(ValidationError):
            AskRequest(question="hello", history=history)

    async def test_ai_route_requires_auth_limits_requests_and_hides_provider_errors(self):
        user = CurrentUser(id="student-1", role="student", email=None, name=None)
        previous_override = app.dependency_overrides.get(ai_routes.get_current_user)
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app, client=("203.0.113.88", 12345)),
            base_url="http://testserver",
        ) as client:
            unauthenticated = await client.post("/api/ai/ask", json={"question": "Hello"})
            self.assertEqual(unauthenticated.status_code, 401)

            app.dependency_overrides[ai_routes.get_current_user] = lambda: user
            try:
                with patch.object(
                    ai_routes,
                    "answer_with_poe",
                    new=AsyncMock(return_value=("Poe answer", [])),
                ):
                    responses = [
                        await client.post("/api/ai/ask", json={"question": "Hello"})
                        for _ in range(13)
                    ]
                self.assertEqual([response.status_code for response in responses[:12]], [200] * 12)
                self.assertEqual(responses[-1].status_code, 429)
            finally:
                if previous_override is None:
                    app.dependency_overrides.pop(ai_routes.get_current_user, None)
                else:
                    app.dependency_overrides[ai_routes.get_current_user] = previous_override

        app.dependency_overrides[ai_routes.get_current_user] = lambda: user
        try:
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=app, client=("203.0.113.89", 12345)),
                base_url="http://testserver",
            ) as client:
                with patch.object(
                    ai_routes,
                    "answer_with_poe",
                    new=AsyncMock(
                        side_effect=poe_assistant.PoeAssistantUnavailable("provider secret detail")
                    ),
                ):
                    unavailable = await client.post(
                        "/api/ai/ask",
                        json={"question": "Hello"},
                    )
            self.assertEqual(unavailable.status_code, 503)
            self.assertEqual(unavailable.json()["detail"], UNAVAILABLE_MESSAGE)
            self.assertNotIn("provider secret detail", unavailable.text)
        finally:
            if previous_override is None:
                app.dependency_overrides.pop(ai_routes.get_current_user, None)
            else:
                app.dependency_overrides[ai_routes.get_current_user] = previous_override


if __name__ == "__main__":
    unittest.main()
