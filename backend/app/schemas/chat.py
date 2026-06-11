from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    page_context: str | None = Field(default=None, max_length=120)


class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str] = Field(default_factory=list)
