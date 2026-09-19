from . import db_helpers


async def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "info",
    priority: str = "normal",
    link: str | None = None,
) -> dict:
    payload = {
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "priority": priority,
        "read": False,
        "link": link,
    }
    return await db_helpers.insert_one("notifications", payload)
