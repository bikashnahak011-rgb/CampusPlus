from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..auth import CurrentUser, get_current_user, require_admin
from ..services import db_helpers
from ..services.insight_service import copilot_answer

router = APIRouter(prefix="/assistant", tags=["assistant"])


class Question(BaseModel):
    question: str = Field(min_length=3, max_length=500)


@router.post("/admin")
async def admin_copilot(payload: Question, _: CurrentUser = Depends(require_admin)):
    return await copilot_answer(payload.question)


@router.post("/student")
async def student_assistant(payload: Question, user: CurrentUser = Depends(get_current_user)):
    if user.role != "student":
        return {"answer": "Student assistant queries are available to student accounts only.", "data_used": {}}
    question = payload.question.lower()
    data_used: dict = {}
    if "attendance" in question:
        data_used["attendance"] = (
            db_helpers.filtered_query("attendance", "subject_id, total_classes, present_classes")
            .eq("student_id", user.id)
            .execute()
            .data
            or []
        )
        return {"answer": "Here is your attendance data.", "data_used": data_used}
    if "complaint" in question:
        data_used["complaints"] = (
            db_helpers.filtered_query("complaints", "id, category, status, created_at")
            .eq("student_id", user.id)
            .execute()
            .data
            or []
        )
        return {"answer": "Here are the complaints you submitted.", "data_used": data_used}
    if "leave" in question:
        data_used["leave_requests"] = (
            db_helpers.filtered_query("leave_requests", "id, type, status, from_date, to_date")
            .eq("student_id", user.id)
            .execute()
            .data
            or []
        )
        return {"answer": "Here is the status of your leave requests.", "data_used": data_used}
    data_used["requests"] = (
        db_helpers.filtered_query("requests", "id, type, status, created_at")
        .eq("student_id", user.id)
        .execute()
        .data
        or []
    )
    return {"answer": "Here are your current requests.", "data_used": data_used}
