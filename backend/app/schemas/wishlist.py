from pydantic import BaseModel, Field


class WishlistResponse(BaseModel):
    product_ids: list[str]


class WishlistToggleRequest(BaseModel):
    product_id: str = Field(min_length=1)


class WishlistToggleResponse(BaseModel):
    liked: bool
    product_ids: list[str]


class WishlistSyncRequest(BaseModel):
    product_ids: list[str] = Field(default_factory=list)


class WishlistSetRequest(BaseModel):
    product_id: str = Field(min_length=1)
    liked: bool
