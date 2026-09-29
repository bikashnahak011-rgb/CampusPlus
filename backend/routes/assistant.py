from collections import Counter
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ..auth import CurrentUser, get_current_user, require_admin
from ..config import get_settings
from ..services import db_helpers
from ..services.insight_service import copilot_answer

router = APIRouter(prefix="/assistant", tags=["assistant"])


class Question(BaseModel):
    question: str = Field(min_length=3, max_length=500)


@router.post("/admin")
async def admin_copilot(payload: Question, _: CurrentUser = Depends(require_admin)):
    return await copilot_answer(payload.question)


@router.post("/student")
async def student_assistant(payload: Question, user: CurrentUser = Depends(get_current_user)):
    if user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student assistant queries are available to student accounts only.")

    question = payload.question.lower()
    data_used: dict = {}

    if "attendance" in question:
        rows = (
            db_helpers.filtered_query("attendance", "subject_id, total_classes, present_classes")
            .eq("student_id", user.id)
            .execute()
            .data
            or []
        )

        total = sum(int(row.get("total_classes") or 0) for row in rows)
        present = sum(int(row.get("present_classes") or 0) for row in rows)
        required = get_settings().attendance_required
        percentage = round((present / total) * 100, 1) if total else None
        data_used["attendance"] = {
            "total_classes": total,
            "present_classes": present,
            "percentage": percentage,
            "required_percentage": required,
        }

        if percentage is None:
            answer = "No attendance records are available for your account yet."
        else:
            answer = f"Your attendance is {percentage}% ({present} of {total} classes). The required attendance is {required:g}%."
            if percentage < required:
                answer += " You are currently below the requirement."
        return {"answer": answer, "data_used": data_used}

    if "complaint" in question:
        complaints = (
            db_helpers.filtered_query("complaints", "id, category, status, created_at")
            .eq("student_id", user.id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
            .data
            or []
        )

        data_used["complaints"] = complaints
        if not complaints:
            answer = "You have not submitted any complaints yet."
        else:
            counts = Counter(row.get("status", "Unknown") for row in complaints)
            summary = ", ".join(f"{count} {label.lower()}" for label, count in sorted(counts.items()))
            answer = f"You have {len(complaints)} complaints: {summary}."
        return {"answer": answer, "data_used": data_used}

    if any(term in question for term in ("leave", "gate pass", "gatepass")):
        requests = (
            db_helpers.filtered_query("leave_requests", "id, type, status, from_date, to_date")
            .eq("student_id", user.id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
            .data
            or []
        )

        data_used["leave_requests"] = requests
        if not requests:
            answer = "You have no leave or gate-pass requests on record."
        else:
            counts = Counter(row.get("status", "Unknown") for row in requests)
            summary = ", ".join(f"{count} {label.lower()}" for label, count in sorted(counts.items()))
            answer = f"You have {len(requests)} leave or gate-pass requests: {summary}."
        return {"answer": answer, "data_used": data_used}

    if any(term in question for term in ("mess", "menu", "food", "breakfast", "lunch", "dinner")):
        menu = await db_helpers.select_rows("mess_menu", "day, breakfast, lunch, snacks, dinner")
        today = date.today().strftime("%A")
        today_menu = next((row for row in menu if str(row.get("day", "")).lower() == today.lower()), None)
        data_used["mess_menu"] = today_menu or {}
        if not today_menu:
            answer = f"There is no mess menu published for {today}."
        else:
            meals = [
                f"{label}: {today_menu[key]}"
                for key, label in (("breakfast", "Breakfast"), ("lunch", "Lunch"), ("snacks", "Snacks"), ("dinner", "Dinner"))
                if today_menu.get(key)
            ]
            answer = f"Today's ({today}) mess menu: " + "; ".join(meals)
        return {"answer": answer, "data_used": data_used}

    if any(term in question for term in ("document", "certificate", "request")):
        requests = (
            db_helpers.filtered_query("requests", "id, type, status, created_at")
            .eq("student_id", user.id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
            .data
            or []
        )
        data_used["requests"] = requests
        if not requests:
            answer = "You have no document requests on record."
        else:
            counts = Counter(row.get("status", "Unknown") for row in requests)
            summary = ", ".join(f"{count} {label.lower()}" for label, count in sorted(counts.items()))
            answer = f"You have {len(requests)} document requests: {summary}."
        return {"answer": answer, "data_used": data_used}

    return {
        "answer": "I can look up your attendance, complaints, leave and gate-pass requests, document requests, or today's mess menu. What would you like to check?",
        "data_used": data_used,
    }
