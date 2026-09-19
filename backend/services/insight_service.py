from . import ai_service, db_helpers
from .attendance_service import analyze_attendance
from .clustering_service import analyze_complaints
from .mess_service import forecast_meals


async def build_action_center() -> dict:
    attendance = await analyze_attendance(notify=False)
    complaints = (
        db_helpers.filtered_query("complaints", "id, location, priority, status")
        .execute()
        .data
        or []
    )
    unresolved = [row for row in complaints if row.get("status") not in {"Resolved", "Closed"}]
    high_priority = [row for row in unresolved if row.get("priority") in {"High", "Critical"}]
    hotspots = {}
    for row in unresolved:
        location = row.get("location") or "Unknown"
        hotspots[location] = hotspots.get(location, 0) + 1
    _, clusters = await analyze_complaints()
    forecast = await forecast_meals()
    return {
        "attendance_below_required": len(attendance.warnings),
        "unresolved_complaints": len(unresolved),
        "high_priority_complaints": len(high_priority),
        "complaint_hotspots": len(hotspots),
        "top_hotspots": sorted(hotspots.items(), key=lambda item: item[1], reverse=True)[:5],
        "incident_clusters": [cluster.model_dump() for cluster in clusters],
        "mess_demand": forecast,
    }


async def copilot_answer(question: str) -> dict:
    stats = await build_action_center()
    return {"answer": ai_service.answer_query(question, stats), "data_used": stats}
