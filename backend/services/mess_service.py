from collections import Counter
from datetime import date

from . import db_helpers


async def forecast_meals() -> dict:
    feedback = await db_helpers.select_rows("mess_feedback", "day, rating, created_at")
    occupancy = await db_helpers.select_rows("rooms", "capacity")
    approved_leave = (
        db_helpers.filtered_query("leave_requests", "id")
        .eq("status", "Approved")
        .gte("to_date", date.today().isoformat())
        .execute()
        .data
        or []
    )
    capacity = sum(int(row.get("capacity") or 0) for row in occupancy)
    leave_factor = max(0.65, 1 - (len(approved_leave) / max(capacity, 1)))
    demand = {meal: round(capacity * leave_factor) for meal in ("breakfast", "lunch", "dinner")}
    ratings = [int(row["rating"]) for row in feedback if row.get("rating")]
    confidence = "high" if len(feedback) >= 30 else "medium" if len(feedback) >= 10 else "low"
    return {
        "date": date.today().isoformat(),
        "forecast": demand,
        "confidence": confidence,
        "uncertainty": "Historical meal volume is limited" if confidence == "low" else "Based on current occupancy and approved leave",
        "inputs": {"room_capacity": capacity, "approved_leave": len(approved_leave), "feedback_records": len(feedback)},
    }
