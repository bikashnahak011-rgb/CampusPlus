from fastapi import APIRouter, Depends

from ..auth import CurrentUser, require_admin
from ..services.mess_service import forecast_meals

router = APIRouter(prefix="/mess", tags=["mess"])


@router.get("/forecast")
async def meal_forecast(_: CurrentUser = Depends(require_admin)):
    return await forecast_meals()
