from pydantic import BaseModel, Field


class SubscribeRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=254)


class SubscribeResponse(BaseModel):
    ok: bool = True
    message: str
    email: str
    already_subscribed: bool = False
    welcome_email_sent: bool = False
