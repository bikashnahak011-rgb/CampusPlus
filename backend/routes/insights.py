from fastapi import APIRouter, Depends

from ..auth import CurrentUser, require_admin
from ..services.insight_service import build_action_center

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/action-center")
async def action_center(_: CurrentUser = Depends(require_admin)):
    return await build_action_center()
