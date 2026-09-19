from collections import defaultdict
from datetime import datetime, timezone

from ..models.complaint import ComplaintAnalysis, IncidentCluster
from . import ai_service, db_helpers


async def analyze_complaints() -> tuple[list[ComplaintAnalysis], list[IncidentCluster]]:
    complaints = (
        db_helpers.filtered_query("complaints", "id, student_id, description, category, location, priority, status, created_at")
        .not_.in_("status", ["Resolved", "Closed"])
        .execute()
        .data
        or []
    )
    analyses: list[ComplaintAnalysis] = []
    clusters: dict[tuple[str, str | None], list[dict]] = defaultdict(list)

    for complaint in complaints:
        result = ai_service.classify_complaint(complaint.get("description", ""), complaint.get("category"))
        location = ai_service.extract_location(complaint.get("description", ""), complaint.get("location"))
        created = complaint.get("created_at")
        age_days = 0
        if created:
            try:
                age_days = (datetime.now(timezone.utc) - datetime.fromisoformat(created.replace("Z", "+00:00"))).days
            except ValueError:
                pass
        cluster_key = (result["category"], location.lower() if location else None)
        clusters[cluster_key].append(complaint)
        analyses.append(ComplaintAnalysis(
            complaint_id=complaint["id"],
            category=result["category"],
            summary=result["summary"],
            location=location,
            urgency=result["urgency"],
            severity=ai_service.severity(1, result["urgency"], age_days),
        ))

    incidents: list[IncidentCluster] = []
    for (category, location), reports in clusters.items():
        if len(reports) < 2:
            continue
        severity = ai_service.severity(len(reports), "HIGH" if any(r.get("priority") == "High" for r in reports) else "NORMAL")
        incidents.append(IncidentCluster(
            category=category,
            location=location.title() if location else None,
            reports=len(reports),
            affected_students=len({r.get("student_id") for r in reports if r.get("student_id")} ),
            severity=severity,
            complaint_ids=[r["id"] for r in reports],
        ))
    return analyses, incidents
