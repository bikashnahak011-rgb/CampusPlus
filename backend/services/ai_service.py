import re
from collections import Counter
from difflib import SequenceMatcher

CATEGORY_KEYWORDS = {
    "water": {"water", "leak", "leakage", "plumbing", "tap", "supply"},
    "electricity": {"electricity", "power", "light", "fan", "socket", "voltage"},
    "cleaning": {"clean", "garbage", "waste", "dirty", "hygiene", "washroom", "bathroom"},
    "internet": {"wifi", "internet", "network", "router", "connection"},
    "security": {"security", "unsafe", "theft", "threat", "harassment", "fire"},
    "mess": {"food", "meal", "mess", "dining", "breakfast", "lunch", "dinner"},
}
URGENCY_TERMS = {"urgent", "emergency", "danger", "unsafe", "fire", "injury", "immediately", "critical"}


def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", " ", text.lower()).strip()


def classify_complaint(description: str, category: str | None = None) -> dict[str, str]:
    text = normalize(description)
    scores = {name: sum(word in text for word in words) for name, words in CATEGORY_KEYWORDS.items()}
    selected = max(scores, key=scores.get) if max(scores.values(), default=0) else (category or "general").lower()
    urgency = "HIGH" if any(term in text for term in URGENCY_TERMS) else "NORMAL"
    summary = " ".join(description.strip().split())[:180]
    return {"category": selected, "urgency": urgency, "summary": summary}


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
        return f"{stats['attendance_below_required']} students are below the 75% attendance threshold."
    if "highest" in text or "priority" in text:
        return f"There are {stats['high_priority_complaints']} high-priority unresolved complaints."
    if "complaint" in text:
        return f"There are {stats['unresolved_complaints']} unresolved complaints across {stats['complaint_hotspots']} active hotspots."
    return "I can answer attendance, unresolved complaint, priority, and hotspot questions from the current campus data."
