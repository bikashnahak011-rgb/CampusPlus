import asyncio
import json
import logging
import uuid
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, HttpUrl, model_validator
from pywebpush import WebPushException, webpush

from ..auth import CurrentUser, get_current_user, require_admin
from ..config import get_settings
from ..database import get_supabase

router = APIRouter(prefix="/notifications", tags=["push notifications"])
logger = logging.getLogger(__name__)


class PushKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscription(BaseModel):
    endpoint: HttpUrl
    keys: PushKeys


class PushNotice(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    body: str = Field(min_length=1, max_length=4000)
    target: str = "All Students"
    priority: Literal["critical", "important", "normal"] = "normal"
    important: bool = False

    @model_validator(mode="after")
    def keep_legacy_important_notices_important(self):
        if self.important and self.priority == "normal":
            self.priority = "important"
        return self


def _matches_target(target: str, profile: dict[str, Any]) -> bool:
    if target == "All Students":
        return True

    department = f"{profile.get('department') or ''} {profile.get('branch') or ''}".lower()
    year = profile.get("year")
    hostel_block = profile.get("hostel_block")

    if target == "Computer Science":
        return any(term in department for term in ("computer", "cse", "cs", "information technology"))
    if target == "Mechanical Engg":
        return "mechanical" in department or "mech" in department
    if target == "Electronics":
        return any(term in department for term in ("electronics", "ece", "electrical"))
    if target.startswith("Year "):
        try:
            return int(target.removeprefix("Year ")) == int(year)
        except (TypeError, ValueError):
            return False
    if target == "Hostel":
        return bool(hostel_block)
    if target == "Day Scholars":
        return not hostel_block
    return False


@router.get("/push-public-key")
async def push_public_key():
    public_key = get_settings().vapid_public_key
    if not public_key:
        raise HTTPException(status_code=503, detail="Web push is not configured on the server")
    return {"public_key": public_key}


@router.post("/push-subscription")
async def save_push_subscription(payload: PushSubscription, user: CurrentUser = Depends(get_current_user)):
    get_supabase().table("push_subscriptions").upsert(
        {
            "user_id": user.id,
            "endpoint": str(payload.endpoint),
            "keys": payload.keys.model_dump(),
        },
        on_conflict="endpoint",
    ).execute()
    return {"saved": True}


@router.delete("/push-subscription")
async def delete_push_subscription(payload: PushSubscription, user: CurrentUser = Depends(get_current_user)):
    get_supabase().table("push_subscriptions").delete().eq("endpoint", str(payload.endpoint)).eq("user_id", user.id).execute()
    return {"deleted": True}


async def _send_push(subscription: dict[str, Any], payload: str, private_key: str, subject: str):
    urgency = {"critical": "high", "important": "normal", "normal": "low"}
    return await asyncio.to_thread(
        webpush,
        subscription_info={"endpoint": subscription["endpoint"], "keys": subscription["keys"]},
        data=payload,
        vapid_private_key=private_key,
        vapid_claims={"sub": subject},
        headers={"Urgency": urgency.get(json.loads(payload).get("priority", "normal"), "normal")},
    )


@router.post("/push-notice")
async def send_notice_push(payload: PushNotice, _: CurrentUser = Depends(require_admin)):
    settings = get_settings()
    supabase = get_supabase()
    profiles = (
        supabase.table("profiles")
        .select("id, department, branch, year, hostel_block")
        .eq("role", "student")
        .execute()
        .data
        or []
    )
    matching_profiles = [profile for profile in profiles if _matches_target(payload.target, profile)]
    user_ids = [profile["id"] for profile in matching_profiles]
    if not user_ids:
        return {
            "in_app_sent": 0,
            "in_app_failed": 0,
            "push_eligible": 0,
            "push_sent": 0,
            "expired": 0,
            "notified": 0,
            "push_configured": bool(settings.vapid_private_key and settings.vapid_public_key),
        }

    notification_rows = [
        {
            "user_id": profile["id"],
            "title": payload.title,
            "message": payload.body,
            "type": "notice",
            "priority": payload.priority,
            "link": "/student/notifications",
            "read": False,
        }
        for profile in matching_profiles
    ]
    in_app_sent = 0
    in_app_failed = 0
    try:
        supabase.table("notifications").insert(notification_rows).execute()
        in_app_sent = len(notification_rows)
    except Exception:
        logger.exception("Could not create in-app notifications for notice %s", payload.title)
        in_app_failed = len(notification_rows)

    push_sent = 0
    expired = 0
    push_eligible = 0
    if settings.vapid_private_key and settings.vapid_public_key:
        subscriptions = (
            supabase.table("push_subscriptions")
            .select("user_id, endpoint, keys")
            .in_("user_id", user_ids)
            .execute()
            .data
            or []
        )
        push_eligible = len(subscriptions)
        message = json.dumps({
            "title": payload.title,
            "body": payload.body[:400],
            "priority": payload.priority,
            "url": "/student/notifications",
            "tag": "notice-" + str(uuid.uuid4()),
        })

        push_semaphore = asyncio.Semaphore(20)

        async def send_to_subscription(subscription: dict[str, Any]) -> tuple[bool, bool]:
            async with push_semaphore:
                try:
                    await _send_push(subscription, message, settings.vapid_private_key, settings.vapid_subject)
                    return True, False
                except WebPushException as exc:
                    status_code = getattr(getattr(exc, "response", None), "status_code", None)
                    if status_code in (404, 410):
                        supabase.table("push_subscriptions").delete().eq("endpoint", subscription["endpoint"]).execute()
                        return False, True
                    logger.warning("Push delivery failed with status %s", status_code)
                except Exception:
                    logger.exception("Push delivery failed")
                return False, False

        push_results = await asyncio.gather(*(send_to_subscription(subscription) for subscription in subscriptions))
        push_sent = sum(sent for sent, _ in push_results)
        expired = sum(was_expired for _, was_expired in push_results)

    return {
        "in_app_sent": in_app_sent,
        "in_app_failed": in_app_failed,
        "push_eligible": push_eligible,
        "push_sent": push_sent,
        "expired": expired,
        "notified": len(user_ids),
        "push_configured": bool(settings.vapid_private_key and settings.vapid_public_key),
    }
