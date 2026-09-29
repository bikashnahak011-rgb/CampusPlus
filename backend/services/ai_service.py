import json
import logging
import re
from difflib import SequenceMatcher

import httpx

from ..config import get_settings

logger = logging.getLogger(__name__)

CATEGORY_KEYWORDS = {
    "water": {"water", "leak", "leakage", "plumbing", "tap", "supply"},
    "electricity": {"electricity", "power", "light", "fan", "socket", "voltage"},
    "cleaning": {"clean", "garbage", "waste", "dirty", "hygiene", "washroom", "bathroom"},
    "internet": {"wifi", "internet", "network", "router", "connection"},
    "security": {"security", "unsafe", "theft", "threat", "harassment", "fire"},
    "mess": {"food", "meal", "mess", "dining", "breakfast", "lunch", "dinner"},
}
URGENCY_TERMS = {"urgent", "emergency", "danger", "unsafe", "fire", "injury", "immediately", "critical"}
HIGH_RISK_FAILURES = {
    "water": {"leak", "leakage", "burst", "flood", "overflow"},
    "electricity": {"spark", "sparking", "short circuit", "burning", "smoke", "exposed wire"},
    "security": {"theft", "threat", "harassment", "fire"},
}


def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", " ", text.lower()).strip()


def classify_complaint(description: str, category: str | None = None) -> dict[str, str]:
    text = normalize(description)
    scores = {name: sum(word in text for word in words) for name, words in CATEGORY_KEYWORDS.items()}
    selected = max(scores, key=scores.get) if max(scores.values(), default=0) else (category or "general").lower()
    urgent = any(re.search(rf"\b{re.escape(term)}\b", text) for term in URGENCY_TERMS)
    infrastructure_failure = any(
        term in text for term in HIGH_RISK_FAILURES.get(selected, set())
    )
    urgency = "HIGH" if urgent or infrastructure_failure else "NORMAL"
    summary = " ".join(description.strip().split())[:180]
    return {"category": selected, "urgency": urgency, "summary": summary}


async def _openai_json(system_prompt: str, user_prompt: str) -> dict | None:
    settings = get_settings()
    if settings.ai_provider.lower() != "openai" or not settings.openai_api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                json={
                    "model": settings.openai_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1,
                },
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            result = json.loads(content)
            return result if isinstance(result, dict) else None
    except (httpx.HTTPError, KeyError, IndexError, TypeError, json.JSONDecodeError):
        logger.warning("Configured AI provider failed; using deterministic rules.")
        return None


async def analyze_complaint_text(description: str) -> dict[str, str]:
    rules = classify_complaint(description)
    location = extract_location(description)
    generated = await _openai_json(
        "Classify a campus complaint. Return JSON only with category (water, electricity, cleaning, mess, internet, security, or general), urgency (HIGH or NORMAL), location (string or null), and suggested_action (short string). Only use facts from the report.",
        description,
    )
    if not generated:
        return {
            **rules,
            "location": location or "Campus",
            "suggested_action": "Dispatch the appropriate team and escalate this report." if rules["urgency"] == "HIGH" else "Send this report to the appropriate campus office for review.",
            "source": "backend-rules",
        }

    category = str(generated.get("category", rules["category"])).lower()
    if category not in {*CATEGORY_KEYWORDS, "general"}:
        category = rules["category"]
    urgency = str(generated.get("urgency", rules["urgency"])).upper()
    if urgency not in {"HIGH", "NORMAL"}:
        urgency = rules["urgency"]
    model_location = generated.get("location")
    if not isinstance(model_location, str) or not model_location.strip():
        model_location = location or "Campus"

    return {
        "category": category,
        "urgency": urgency,
        "summary": rules["summary"],
        "location": model_location.strip()[:120],
        "suggested_action": str(generated.get("suggested_action") or "Send this report to the appropriate campus office for review.")[:300],
        "source": "openai",
    }


def extract_location(text: str, fallback: str | None = None) -> str | None:
    match = re.search(r"(?:room|block|hostel|building)\s*[a-z0-9 -]+", text, re.IGNORECASE)
    return match.group(0).strip().title() if match else fallback


def similarity(left: str, right: str) -> float:
    return SequenceMatcher(None, normalize(left), normalize(right)).ratio()


def severity(report_count: int, urgency: str, age_days: int = 0) -> str:
    if urgency == "HIGH" or report_count >= 5 or age_days >= 7:
        return "CRITICAL" if urgency == "HIGH" and report_count >= 5 else "HIGH"
    if report_count >= 2 or age_days >= 3:
        return "MEDIUM"
    return "LOW"


def answer_query(question: str, stats: dict) -> str:
    text = normalize(question)
    if "attendance" in text and ("below" in text or "75" in text):
        required = stats.get("attendance_required", 75)
        return f"{stats['attendance_below_required']} students are below the {required:g}% attendance threshold."
    if "highest" in text or "priority" in text:
        return f"There are {stats['high_priority_complaints']} high-priority unresolved complaints."
    if "complaint" in text:
        return f"There are {stats['unresolved_complaints']} unresolved complaints across {stats['complaint_hotspots']} active hotspots."
    return "I can answer attendance, unresolved complaint, priority, and hotspot questions from the current campus data."


async def answer_query_with_ai(question: str, stats: dict) -> str:
    fallback = answer_query(question, stats)
    generated = await _openai_json(
        "Answer the administrator's campus operations question using only the supplied aggregate statistics. Do not invent facts or expose student-level data. Return JSON only with an answer string.",
        json.dumps({"question": question, "aggregate_statistics": stats}, default=str),
    )
    answer = generated.get("answer") if generated else None
    return answer.strip()[:1200] if isinstance(answer, str) and answer.strip() else fallback
