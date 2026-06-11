from app.models.store import DataStore
from app.schemas.home import FeaturedCategory, HomeStatsResponse

FEATURED_PATHS = ["makhana/plain-makhana"]

DESCRIPTIONS = {
    "makhana/plain-makhana": "Pure & natural phool makhana in premium grades",
}


class HomeService:
    def __init__(self, store: DataStore) -> None:
        self.store = store

    def get_stats(self) -> HomeStatsResponse:
        featured: list[FeaturedCategory] = []
        for path in FEATURED_PATHS:
            cat = self.store.categories_by_path.get(path)
            if not cat:
                continue
            featured.append(
                FeaturedCategory(
                    id=cat.id,
                    name=cat.name,
                    path=cat.path,
                    product_count=len(self.store.get_products_for_path(path)),
                    description=DESCRIPTIONS.get(path),
                )
            )

        return HomeStatsResponse(
            total_products=len(self.store.products),
            total_categories=len(self.store.categories),
            featured_categories=featured,
        )
