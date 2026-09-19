from datetime import datetime

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    user_id: str
    title: str = Field(min_length=1, max_length=160)
    message: str = Field(min_length=1, max_length=1000)
    type: str = "info"
    priority: str = "normal"
    link: str | None = None


class NotificationOut(NotificationCreate):
    id: str
    is_read: bool = False
    created_at: datetime | None = None
