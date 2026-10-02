import unittest
from unittest.mock import AsyncMock, patch

from backend.models.notification import NotificationCreate
from backend.routes.notifications import send_notification


class AdminNotificationTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_notification_maps_type_to_service_argument(self):
        payload = NotificationCreate(
            user_id="student-id",
            title="Direct message",
            message="Please visit the administration office.",
            type="message",
            link="/student/notifications",
        )
        expected = {"id": "notification-id"}

        with patch("backend.routes.notifications.create_notification", new_callable=AsyncMock) as create_notification:
            create_notification.return_value = expected
            result = await send_notification(payload)

        self.assertEqual(result, expected)
        create_notification.assert_awaited_once_with(
            user_id="student-id",
            title="Direct message",
            message="Please visit the administration office.",
            notification_type="message",
            priority="normal",
            link="/student/notifications",
        )


if __name__ == "__main__":
    unittest.main()