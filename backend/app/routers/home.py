from fastapi import APIRouter

from app.dependencies import get_home_service
from app.schemas.home import HomeStatsResponse

router = APIRouter(prefix="/home", tags=["home"])


@router.get("/stats", response_model=HomeStatsResponse)
def get_home_stats() -> HomeStatsResponse:
    service = get_home_service()
    return service.get_stats()
