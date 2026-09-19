from fastapi import APIRouter, Depends

from ..auth import CurrentUser, get_current_user, require_admin
from ..models.notification import NotificationCreate
from ..services import db_helpers
from ..services.notification_service import create_notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/me")
async def my_notifications(user: CurrentUser = Depends(get_current_user)):
    rows = (
        db_helpers.filtered_query("notifications", "id, user_id, title, message, type, priority, read, created_at, link")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
        .data
        or []
    )
    return [{**row, "is_read": row.pop("read", False)} for row in rows]


@router.post("/admin", dependencies=[Depends(require_admin)])
async def send_notification(payload: NotificationCreate):
    return await create_notification(**payload.model_dump())
