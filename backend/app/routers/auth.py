from fastapi import APIRouter, Header, HTTPException

from app.schemas.auth import (
    MeResponse,
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
)
from app.services.auth_service import get_auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-otp", response_model=SendOtpResponse)
def send_otp(body: SendOtpRequest) -> SendOtpResponse:
    service = get_auth_service()
    try:
        phone, expires_in, debug_otp = service.send_otp(body.phone)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return SendOtpResponse(
        message="OTP sent successfully",
        phone=phone,
        expires_in=expires_in,
        debug_otp=debug_otp,
    )


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def verify_otp(body: VerifyOtpRequest) -> VerifyOtpResponse:
    service = get_auth_service()
    try:
        phone, token = service.verify_otp(body.phone, body.otp)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return VerifyOtpResponse(token=token, phone=phone)


@router.get("/me", response_model=MeResponse)
def me(authorization: str | None = Header(default=None)) -> MeResponse:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.removeprefix("Bearer ").strip()
    service = get_auth_service()
    phone = service.get_session(token)
    if not phone:
        raise HTTPException(status_code=401, detail="Session expired")

    return MeResponse(phone=phone)


@router.post("/logout")
def logout(authorization: str | None = Header(default=None)) -> dict[str, bool]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        get_auth_service().logout(token)
    return {"ok": True}
