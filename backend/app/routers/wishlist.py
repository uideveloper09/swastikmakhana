from fastapi import APIRouter, Header, HTTPException

from app.schemas.wishlist import (
    WishlistResponse,
    WishlistSetRequest,
    WishlistSyncRequest,
    WishlistToggleRequest,
    WishlistToggleResponse,
)
from app.services.auth_service import get_auth_service
from app.services.wishlist_service import get_wishlist_service

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


def _require_phone(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.removeprefix("Bearer ").strip()
    phone = get_auth_service().get_session(token)
    if not phone:
        raise HTTPException(status_code=401, detail="Session expired")
    return phone


@router.get("", response_model=WishlistResponse)
def get_wishlist(authorization: str | None = Header(default=None)) -> WishlistResponse:
    phone = _require_phone(authorization)
    product_ids = get_wishlist_service().get_product_ids(phone)
    return WishlistResponse(product_ids=product_ids)


@router.post("/toggle", response_model=WishlistToggleResponse)
def toggle_wishlist(
    body: WishlistToggleRequest,
    authorization: str | None = Header(default=None),
) -> WishlistToggleResponse:
    phone = _require_phone(authorization)
    service = get_wishlist_service()
    try:
        liked, product_ids = service.toggle(phone, body.product_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return WishlistToggleResponse(liked=liked, product_ids=product_ids)


@router.put("/set", response_model=WishlistResponse)
def set_wishlist_item(
    body: WishlistSetRequest,
    authorization: str | None = Header(default=None),
) -> WishlistResponse:
    phone = _require_phone(authorization)
    service = get_wishlist_service()
    try:
        product_ids = service.set_liked(phone, body.product_id, body.liked)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return WishlistResponse(product_ids=product_ids)


@router.put("/sync", response_model=WishlistResponse)
def sync_wishlist(
    body: WishlistSyncRequest,
    authorization: str | None = Header(default=None),
) -> WishlistResponse:
    phone = _require_phone(authorization)
    product_ids = get_wishlist_service().sync(phone, body.product_ids)
    return WishlistResponse(product_ids=product_ids)
