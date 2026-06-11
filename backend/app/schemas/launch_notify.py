from pydantic import BaseModel, Field


class LaunchNotifyRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=254)
    category_slug: str = Field(..., min_length=2, max_length=80)
    category_name: str = Field(..., min_length=2, max_length=120)


class LaunchNotifyEmailRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=254)
    category_name: str = Field(..., min_length=2, max_length=120)


class LaunchNotifyResponse(BaseModel):
    ok: bool = True
    message: str
    email: str
    category_name: str
    already_registered: bool = False
    confirmation_email_sent: bool = False


class LaunchNotifyEmailResponse(BaseModel):
    ok: bool = True
    email_sent: bool = False
    message: str = ""
