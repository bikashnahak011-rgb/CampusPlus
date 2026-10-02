import asyncio
import html
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from ..config import Settings, get_settings
from ..database import get_supabase

logger = logging.getLogger(__name__)
RESEND_EMAILS_URL = "https://api.resend.com/emails"
MAX_ATTEMPTS = 5
BATCH_SIZE = 20


def build_email_content(notification: dict[str, Any], recipient_name: str, app_url: str | None) -> tuple[str, str]:
    title = str(notification.get("title") or "Campus update")
    message = str(notification.get("message") or "You have a new campus update.")
    safe_name = html.escape(recipient_name or "student")
    safe_title = html.escape(title)
    safe_message = html.escape(message).replace("\n", "<br>")
    link = notification.get("link")
    action = ""
    text_action = ""
    if app_url and isinstance(link, str) and link.startswith("/"):
        href = html.escape(f"{app_url.rstrip('/')}{link}", quote=True)
        action = f'<p><a href="{href}">Open CampusOne</a></p>'
        text_action = f"\n\nOpen CampusOne: {app_url.rstrip('/')}{link}"

    html_body = (
        '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#202124">'
        f"<p>Hello {safe_name},</p><h2>{safe_title}</h2><p>{safe_message}</p>"
        f"{action}<p style=\"color:#6b7280;font-size:12px\">CampusOne student updates</p></div>"
    )
    text_body = f"Hello {recipient_name or 'student'},\n\n{title}\n\n{message}{text_action}\n\nCampusOne student updates"
    return html_body, text_body


async def send_notification_email(
    client: httpx.AsyncClient,
    notification: dict[str, Any],
    recipient: dict[str, Any],
    settings: Settings,
) -> None:
    if not settings.resend_api_key or not settings.email_from:
        raise RuntimeError("Email delivery is not configured.")

    html_body, text_body = build_email_content(
        notification,
        recipient.get("name") or "student",
        settings.email_app_url,
    )
    response = await client.post(
        RESEND_EMAILS_URL,
        headers={"Authorization": f"Bearer {settings.resend_api_key}"},
        json={
            "from": settings.email_from,
            "to": [recipient["email"]],
            "subject": str(notification.get("title") or "Campus update"),
            "html": html_body,
            "text": text_body,
        },
    )
    response.raise_for_status()


def _run_query(query):
    return query.execute().data or []


async def dispatch_pending_emails_once(
    client: httpx.AsyncClient,
    settings: Settings | None = None,
) -> int:
    settings = settings or get_settings()
    if not settings.resend_api_key or not settings.email_from:
        return 0

    supabase = get_supabase()
    pending = await asyncio.to_thread(
        _run_query,
        supabase.table("notification_email_queue")
        .select("id, notification_id, attempts")
        .eq("status", "pending")
        .order("created_at")
        .limit(BATCH_SIZE),
    )
    sent = 0

    for item in pending:
        attempts = int(item.get("attempts") or 0) + 1
        now = datetime.now(timezone.utc).isoformat()
        claimed = await asyncio.to_thread(
            _run_query,
            supabase.table("notification_email_queue")
            .update({"status": "sending", "attempts": attempts, "updated_at": now})
            .eq("id", item["id"])
            .eq("status", "pending")
            .select("id"),
        )
        if not claimed:
            continue

        try:
            rows = await asyncio.to_thread(
                _run_query,
                supabase.table("notifications")
                .select("user_id, title, message, link")
                .eq("id", item["notification_id"])
                .limit(1),
            )
            notification = rows[0] if rows else None
            if not notification:
                raise RuntimeError("Queued notification no longer exists.")

            profiles = await asyncio.to_thread(
                _run_query,
                supabase.table("profiles")
                .select("email, name")
                .eq("id", notification["user_id"])
                .limit(1),
            )
            recipient = profiles[0] if profiles else None
            if not recipient or not recipient.get("email"):
                raise RuntimeError("Student profile does not have an email address.")

            await send_notification_email(client, notification, recipient, settings)
            await asyncio.to_thread(
                _run_query,
                supabase.table("notification_email_queue")
                .update({"status": "sent", "last_error": None, "updated_at": datetime.now(timezone.utc).isoformat()})
                .eq("id", item["id"]),
            )
            sent += 1
        except Exception as exc:
            status = "failed" if attempts >= MAX_ATTEMPTS else "pending"
            await asyncio.to_thread(
                _run_query,
                supabase.table("notification_email_queue")
                .update({"status": status, "last_error": str(exc)[:500], "updated_at": datetime.now(timezone.utc).isoformat()})
                .eq("id", item["id"]),
            )
            logger.warning("Email delivery for notification %s failed (%s/%s): %s", item["notification_id"], attempts, MAX_ATTEMPTS, exc)

    return sent


async def run_email_dispatcher() -> None:
    settings = get_settings()
    if not settings.resend_api_key or not settings.email_from:
        logger.info("Email notifications are disabled; configure RESEND_API_KEY and EMAIL_FROM to enable them")
        return

    supabase = get_supabase()
    startup_time = datetime.now(timezone.utc).isoformat()
    stale_time = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()
    try:
        await asyncio.to_thread(
            _run_query,
            supabase.table("notification_email_queue")
            .update({"status": "skipped", "last_error": "Email notifications were enabled after this event."})
            .eq("status", "pending")
            .lt("created_at", startup_time),
        )
        await asyncio.to_thread(
            _run_query,
            supabase.table("notification_email_queue")
            .update({"status": "pending", "last_error": None})
            .eq("status", "sending")
            .lt("updated_at", stale_time),
        )
    except Exception:
        logger.exception("Could not initialize the email notification queue")

    async with httpx.AsyncClient(timeout=10) as client:
        while True:
            try:
                await dispatch_pending_emails_once(client, settings)
            except Exception:
                logger.exception("Email notification queue poll failed")
            await asyncio.sleep(max(1, settings.email_poll_interval_seconds))
