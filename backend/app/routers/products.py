from fastapi import APIRouter, HTTPException, Query

from app.dependencies import get_product_service
from app.schemas.product import ProductDetail, ProductListResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    category_path: str = Query(..., description="Category path for PLP"),
    page: int = Query(1, ge=1),
    per_page: int = Query(48, ge=1, le=100),
    sort: str = Query("relevance"),
    brands: list[str] | None = Query(None),
    flavours: list[str] | None = Query(None),
    pack_sizes: list[str] | None = Query(None),
    price_min: float | None = Query(None, ge=0),
    price_max: float | None = Query(None, ge=0),
    discount_min: int | None = Query(None, ge=0),
    discount_max: int | None = Query(None, ge=0),
    rating_min: float | None = Query(None, ge=0, le=5),
    in_stock_only: bool = Query(False),
) -> ProductListResponse:
    service = get_product_service()
    result = service.list_products(
        category_path=category_path.strip("/"),
        page=page,
        per_page=per_page,
        sort=sort,
        brands=brands,
        flavours=flavours,
        pack_sizes=pack_sizes,
        price_min=price_min,
        price_max=price_max,
        discount_min=discount_min,
        discount_max=discount_max,
        rating_min=rating_min,
        in_stock_only=in_stock_only,
    )
    if not result:
        raise HTTPException(status_code=404, detail=f"Category not found: {category_path}")
    return result


@router.get("/{slug}", response_model=ProductDetail)
def get_product(slug: str) -> ProductDetail:
    service = get_product_service()
    result = service.get_product(slug)
    if not result:
        raise HTTPException(status_code=404, detail=f"Product not found: {slug}")
    return result
