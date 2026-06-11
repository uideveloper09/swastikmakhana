from fastapi import APIRouter, HTTPException

from app.schemas.launch_notify import (
    LaunchNotifyEmailRequest,
    LaunchNotifyEmailResponse,
    LaunchNotifyRequest,
    LaunchNotifyResponse,
)
from app.services.launch_notify_service import get_launch_notify_service

router = APIRouter(prefix="/launch-notify", tags=["launch-notify"])


def _confirmation_message(category_name: str, email_sent: bool, already: bool) -> str:
    if already:
        base = f"You're already on the list for {category_name}."
    else:
        base = f"You're in! We'll notify you when {category_name} launches."

    if email_sent:
        return f"{base} Check your inbox for a confirmation email."
    return (
        f"{base} Your request is saved — confirmation email needs SMTP setup in backend/.env."
    )


@router.post("/subscribe", response_model=LaunchNotifyResponse)
def subscribe_launch_notify(body: LaunchNotifyRequest) -> LaunchNotifyResponse:
    service = get_launch_notify_service()
    try:
        email, category_name, already = service.register(
            body.email,
            body.category_slug,
            body.category_name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    email_sent = False
    if not already:
        email_sent, _ = service.send_confirmation(email, category_name)

    return LaunchNotifyResponse(
        message=_confirmation_message(category_name, email_sent, already),
        email=email,
        category_name=category_name,
        already_registered=already,
        confirmation_email_sent=email_sent,
    )


@router.post("/send-confirmation", response_model=LaunchNotifyEmailResponse)
def send_launch_confirmation(body: LaunchNotifyEmailRequest) -> LaunchNotifyEmailResponse:
    service = get_launch_notify_service()
    try:
        email_sent, note = service.send_confirmation(body.email, body.category_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return LaunchNotifyEmailResponse(
        email_sent=email_sent,
        message=note,
    )
