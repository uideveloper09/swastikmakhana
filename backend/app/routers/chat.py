from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import get_chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(body: ChatRequest) -> ChatResponse:
    service = get_chat_service()
    history = [{"role": m.role, "content": m.content} for m in body.history]
    reply, suggestions = service.reply(body.message, history, body.page_context)
    return ChatResponse(reply=reply, suggestions=suggestions)
