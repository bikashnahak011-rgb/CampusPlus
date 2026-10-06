import asyncio
import logging
from typing import Literal

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field, field_validator, model_validator

from ..auth import CurrentUser, get_current_user
from ..limiting import limiter
from ..services.poe_assistant import PoeAssistantUnavailable, answer_from_campus_context, answer_with_poe

router = APIRouter(prefix="/ai", tags=["campus-ai"])
logger = logging.getLogger(__name__)
RULES_FALLBACK_MESSAGE = "I couldn't load that campus information just now. Please try again or open the matching portal section."


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2_000)

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, content: str) -> str:
        content = content.strip()
        if not content:
            raise ValueError("Conversation messages cannot be blank.")
        return content


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2_000)
    history: list[ConversationMessage] = Field(default_factory=list, max_length=10)

    @field_validator("question")
    @classmethod
    def question_must_not_be_blank(cls, question: str) -> str:
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be blank.")
        return question

    @model_validator(mode="after")
    def validate_history_size(self):
        if sum(len(message.content) for message in self.history) > 8_000:
            raise ValueError("Conversation history is too long.")
        return self


@router.post("/ask")
@limiter.limit("12/minute")
async def ask_campus_ai(
    payload: AskRequest,
    request: Request,
    user: CurrentUser = Depends(get_current_user),
):
    try:
        answer, context_sources = await answer_with_poe(
            payload.question,
            [message.model_dump() for message in payload.history],
            user,
        )
        return {"answer": answer, "context_sources": context_sources}
    except PoeAssistantUnavailable:
        greeting = payload.question.strip().lower().rstrip(".!?,")
        if greeting in {"hi", "hii", "hiii", "hello", "hey", "heyy", "good morning", "good afternoon", "good evening"}:
            first_name = (user.name or "there").strip().split(" ")[0]
            return {
                "answer": f"Hi {first_name}! I can help with your campus services and records. Ask me about attendance, complaints, requests, today's menu, or how to use the portal.",
                "context_sources": [],
            }

        try:
            answer, sources = await asyncio.to_thread(
                answer_from_campus_context,
                payload.question[:500],
                user,
            )
            return {
                "answer": answer or RULES_FALLBACK_MESSAGE,
                "context_sources": sources,
            }
        except Exception as exc:
            logger.warning("Campus AI rules fallback failed (%s).", type(exc).__name__)
            return {"answer": RULES_FALLBACK_MESSAGE, "context_sources": []}
