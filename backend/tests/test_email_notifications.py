import unittest
from unittest.mock import AsyncMock

from backend.config import Settings
from backend.services.email_notifications import build_email_content, send_notification_email


class EmailNotificationTests(unittest.IsolatedAsyncioTestCase):
    def test_email_content_escapes_untrusted_text_and_links_to_the_app(self):
        html_body, text_body = build_email_content(
            {
                "title": "<script>alert(1)</script>",
                "message": "Result <b>published</b>",
                "link": "/student/results",
            },
            "Student <Name>",
            "https://campus.example",
        )

        self.assertNotIn("<script>", html_body)
        self.assertIn("&lt;script&gt;", html_body)
        self.assertIn("https://campus.example/student/results", html_body)
        self.assertIn("https://campus.example/student/results", text_body)

    async def test_email_uses_profile_email_and_configured_sender(self):
        response = AsyncMock()
        response.raise_for_status = lambda: None
        client = AsyncMock()
        client.post.return_value = response
        settings = Settings(
            supabase_url="https://example.supabase.co",
            supabase_service_role_key="test-key",
            resend_api_key="test-resend-key",
            email_from="CampusOne <updates@example.edu>",
        )

        await send_notification_email(
            client,
            {"title": "Result published", "message": "Your SGPA is 8.50."},
            {"email": "student@example.com", "name": "Student"},
            settings,
        )

        client.post.assert_awaited_once()
        request = client.post.await_args.kwargs
        self.assertEqual(request["json"]["to"], ["student@example.com"])
        self.assertEqual(request["json"]["from"], "CampusOne <updates@example.edu>")
        self.assertEqual(request["headers"]["Authorization"], "Bearer test-resend-key")


if __name__ == "__main__":
    unittest.main()
