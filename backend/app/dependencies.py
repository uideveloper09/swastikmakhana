from functools import lru_cache
from pathlib import Path

from app.models.store import DataStore
from app.services.category_service import CategoryService
from app.services.home_service import HomeService
from app.services.product_service import ProductService
from app.services.search_service import SearchService

SEED_PATH = Path(__file__).resolve().parent.parent / "data" / "seed.json"


@lru_cache
def get_store() -> DataStore:
    return DataStore(SEED_PATH)


def get_category_service() -> CategoryService:
    return CategoryService(get_store())


def get_product_service() -> ProductService:
    return ProductService(get_store())


def get_search_service() -> SearchService:
    return SearchService(get_store())


def get_home_service() -> HomeService:
    return HomeService(get_store())
