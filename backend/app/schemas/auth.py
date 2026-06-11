from pydantic import BaseModel, Field


class SendOtpRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)


class SendOtpResponse(BaseModel):
    ok: bool = True
    message: str
    phone: str
    expires_in: int
    debug_otp: str | None = None


class VerifyOtpRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=4, max_length=6)


class VerifyOtpResponse(BaseModel):
    ok: bool = True
    token: str
    phone: str


class MeResponse(BaseModel):
    phone: str
