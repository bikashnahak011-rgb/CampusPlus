from collections import defaultdict
from typing import Any

from ..config import get_settings
from ..models.attendance import AttendanceAnalysis, AttendanceWarning
from . import db_helpers
from .notification_service import create_notification


def _risk(percent: float, decreasing: bool) -> str:
    if percent < 60 or (percent < 75 and decreasing):
        return "HIGH"
    if percent < 75 or decreasing:
        return "MEDIUM"
    return "LOW"


async def analyze_attendance(student_id: str | None = None, notify: bool = True) -> AttendanceAnalysis:
    settings = get_settings()
    query = db_helpers.filtered_query("attendance", "student_id, total_classes, present_classes, updated_at")
    if student_id:
        query = query.eq("student_id", student_id)
    rows = query.execute().data or []

    totals: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    for row in rows:
        totals[row["student_id"]][0] += int(row.get("total_classes") or 0)
        totals[row["student_id"]][1] += int(row.get("present_classes") or 0)

    warnings: list[AttendanceWarning] = []
    for sid, (total, present) in totals.items():
        percent = round((present / total) * 100, 2) if total else 100.0
        history = (
            db_helpers.filtered_query("attendance_history", "attendance_percent, recorded_at")
            .eq("student_id", sid)
            .order("recorded_at", desc=True)
            .limit(3)
            .execute()
            .data
            or []
        )
        values = [float(item["attendance_percent"]) for item in history]
        decreasing = len(values) >= 2 and all(values[index] < values[index + 1] for index in range(len(values) - 1))
        if percent < settings.attendance_required or decreasing:
            reason = "Attendance is below required threshold" if percent < settings.attendance_required else "Attendance has continuously decreased"
            warning = AttendanceWarning(
                student_id=sid,
                attendance=percent,
                required=settings.attendance_required,
                risk=_risk(percent, decreasing),
                reason=reason,
                decreasing=decreasing,
            )
            warnings.append(warning)
            if notify:
                await create_notification(
                    sid,
                    "Attendance early warning",
                    f"Your attendance is {percent}%, below the required {settings.attendance_required}%. Please attend upcoming classes regularly.",
                    "attendance",
                    warning.risk.lower(),
                    "/student/attendance",
                )

    return AttendanceAnalysis(analyzed=len(totals), warnings=warnings)
