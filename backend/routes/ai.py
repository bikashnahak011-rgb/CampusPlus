from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator, model_validator

from ..auth import CurrentUser, get_current_user
from ..limiting import limiter
from ..services.poe_assistant import PoeAssistantUnavailable, answer_with_poe

router = APIRouter(prefix="/ai", tags=["campus-ai"])
UNAVAILABLE_MESSAGE = "Campus AI is temporarily unavailable. Please try again in a moment."


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
    except PoeAssistantUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=UNAVAILABLE_MESSAGE,
        ) from exc

    return {"answer": answer, "context_sources": context_sources}
