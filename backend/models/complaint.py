from pydantic import BaseModel, Field


class ComplaintAnalysis(BaseModel):
    complaint_id: str
    category: str
    summary: str
    location: str | None
    urgency: str
    severity: str
    duplicate_of: str | None = None
    similar_complaint_ids: list[str] = Field(default_factory=list)


class IncidentCluster(BaseModel):
    category: str
    location: str | None
    reports: int
    affected_students: int
    severity: str
    complaint_ids: list[str]
