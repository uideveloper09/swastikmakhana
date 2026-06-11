from fastapi import APIRouter, HTTPException, Query

from app.dependencies import get_category_service
from app.schemas.category import CategoryResolveResponse, CategoryTreeNode

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/resolve", response_model=CategoryResolveResponse)
def resolve_category(
    path: str = Query(..., description="Full category path, e.g. makhana"),
) -> CategoryResolveResponse:
    service = get_category_service()
    result = service.resolve_path(path.strip("/"))
    if not result:
        raise HTTPException(status_code=404, detail=f"Category not found: {path}")
    return result


@router.get("/tree", response_model=list[CategoryTreeNode])
def get_category_tree() -> list[CategoryTreeNode]:
    service = get_category_service()
    return service.get_tree()
