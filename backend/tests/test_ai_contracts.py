import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from backend.auth import CurrentUser
from backend.routes import assistant, complaints
from backend.routes.assistant import Question
from backend.routes.complaints import ComplaintText
from backend.services.ai_service import answer_query, classify_complaint


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


class AIContractTests(unittest.IsolatedAsyncioTestCase):
    async def test_complaint_classifier_matches_frontend_contract(self):
        result = {
            "category": "water",
            "urgency": "HIGH",
            "location": "Block A Room 203",
            "suggested_action": "Dispatch maintenance.",
            "source": "backend-rules",
        }
        with patch.object(complaints.ai_service, "analyze_complaint_text", new=AsyncMock(return_value=result)):
            response = await complaints.classify_complaint(
                ComplaintText(description="Water leaking in room 203"),
                CurrentUser(id="student-1", role="student", email=None, name=None),
            )

        self.assertEqual(response["category"], "Water")
        self.assertEqual(response["priority"], "High")
        self.assertEqual(response["department"], "Hostel Maintenance")
        self.assertEqual(response["location"], "Block A Room 203")
        self.assertEqual(response["suggestedAction"], "Dispatch maintenance.")

    async def test_student_attendance_answer_uses_only_the_authenticated_student(self):
        query = FakeQuery([{"total_classes": 50, "present_classes": 40}])
        with (
            patch.object(assistant.db_helpers, "filtered_query", return_value=query),
            patch.object(assistant, "get_settings", return_value=SimpleNamespace(attendance_required=75.0)),
        ):
            response = await assistant.student_assistant(
                Question(question="What is my attendance?"),
                CurrentUser(id="student-1", role="student", email=None, name=None),
            )

        self.assertEqual(query.filters, [("student_id", "student-1")])
        self.assertIn("80.0%", response["answer"])
        self.assertEqual(response["data_used"]["attendance"]["percentage"], 80.0)

    async def test_non_student_cannot_use_student_assistant(self):
        with self.assertRaises(HTTPException) as raised:
            await assistant.student_assistant(
                Question(question="What is my attendance?"),
                CurrentUser(id="admin-1", role="admin", email=None, name=None),
            )
        self.assertEqual(raised.exception.status_code, 403)

    def test_rules_flag_a_water_leak_as_high_urgency(self):
        result = classify_complaint("Water leaking from pipe in hostel block A room 203")
        self.assertEqual(result["category"], "water")
        self.assertEqual(result["urgency"], "HIGH")

    def test_admin_copilot_uses_configured_attendance_threshold(self):
        answer = answer_query(
            "How many students are below the attendance requirement?",
            {"attendance_below_required": 4, "attendance_required": 80},
        )
        self.assertIn("80%", answer)
        self.assertIn("4 students", answer)


if __name__ == "__main__":
    unittest.main()
