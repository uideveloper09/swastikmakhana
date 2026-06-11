from fastapi import APIRouter, HTTPException

from app.schemas.newsletter import SubscribeRequest, SubscribeResponse
from app.services.email_service import EmailDeliveryError
from app.services.newsletter_service import get_newsletter_service

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=SubscribeResponse)
def subscribe(body: SubscribeRequest) -> SubscribeResponse:
    service = get_newsletter_service()
    try:
        email, already, email_sent = service.subscribe(body.email)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if already:
        return SubscribeResponse(
            message="You're already on our list. Watch your inbox for offers!",
            email=email,
            already_subscribed=True,
        )

    if email_sent:
        return SubscribeResponse(
            message="Welcome to the Swastik family! Check your inbox for a welcome email.",
            email=email,
            welcome_email_sent=True,
        )

    return SubscribeResponse(
        message=(
            "You're subscribed! Welcome email requires SMTP setup in backend/.env "
            "(see .env.example)."
        ),
        email=email,
    )
