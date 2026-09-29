from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..auth import CurrentUser, get_current_user, require_admin
from ..services import ai_service
from ..services.clustering_service import analyze_complaints

router = APIRouter(prefix="/complaints", tags=["complaints"])


class ComplaintText(BaseModel):
    description: str = Field(min_length=4, max_length=2000)


@router.post("/classify")
async def classify_complaint(payload: ComplaintText, _: CurrentUser = Depends(get_current_user)):
    result = await ai_service.analyze_complaint_text(payload.description)
    category_labels = {
        "water": "Water",
        "electricity": "Electricity",
        "cleaning": "Cleaning",
        "mess": "Mess",
    }
    departments = {
        "Water": "Hostel Maintenance",
        "Electricity": "Electrical Maintenance",
        "Cleaning": "Housekeeping",
        "Mess": "Mess Committee",
        "Other": "Administration",
    }
    category = category_labels.get(result["category"], "Other")
    priority = "High" if result["urgency"] == "HIGH" else "Medium"
    location = result["location"]

    return {
        "category": category,
        "priority": priority,
        "department": departments[category],
        "location": location,
        "suggestedAction": result["suggested_action"],
        "source": result["source"],
    }


@router.post("/analyze")
async def complaint_analysis(_: CurrentUser = Depends(require_admin)):
    analyses, clusters = await analyze_complaints()
    return {"analyses": [item.model_dump() for item in analyses], "clusters": [item.model_dump() for item in clusters]}
