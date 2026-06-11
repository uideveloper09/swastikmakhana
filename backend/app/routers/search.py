from fastapi import APIRouter, Query

from app.dependencies import get_search_service
from app.schemas.product import ProductListResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=ProductListResponse)
def search_products(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1),
    per_page: int = Query(48, ge=1, le=100),
    sort: str = Query("relevance"),
) -> ProductListResponse:
    service = get_search_service()
    return service.search(query=q, page=page, per_page=per_page, sort=sort)
