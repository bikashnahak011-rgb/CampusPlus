from pydantic import BaseModel, Field


class AttendanceWarning(BaseModel):
    student_id: str
    attendance: float = Field(ge=0, le=100)
    required: float = Field(ge=0, le=100)
    risk: str
    reason: str
    decreasing: bool = False


class AttendanceAnalysis(BaseModel):
    analyzed: int
    warnings: list[AttendanceWarning]
