from fastapi import APIRouter, Depends

from ..auth import CurrentUser, get_current_user, require_admin
from ..services.attendance_service import analyze_attendance

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/analyze")
async def run_attendance_analysis(_: CurrentUser = Depends(require_admin)):
    return (await analyze_attendance()).model_dump()


@router.get("/me")
async def my_attendance(user: CurrentUser = Depends(get_current_user)):
    result = await analyze_attendance(student_id=user.id, notify=False)
    return result.model_dump()
