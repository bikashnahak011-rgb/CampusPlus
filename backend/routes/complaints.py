from fastapi import APIRouter, Depends

from ..auth import CurrentUser, require_admin
from ..services.clustering_service import analyze_complaints

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.post("/analyze")
async def complaint_analysis(_: CurrentUser = Depends(require_admin)):
    analyses, clusters = await analyze_complaints()
    return {"analyses": [item.model_dump() for item in analyses], "clusters": [item.model_dump() for item in clusters]}
