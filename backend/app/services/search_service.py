from __future__ import annotations

import math

from app.models.store import DataStore, Product
from app.schemas.product import Pagination, ProductCard, ProductListResponse
from app.services.product_service import ProductService

PLAIN_SHOP_PATH = "makhana/plain-makhana"


class SearchService:
    def __init__(self, store: DataStore) -> None:
        self.store = store
        self._product_service = ProductService(store)

    def search(
        self,
        query: str,
        page: int = 1,
        per_page: int = 48,
        sort: str = "relevance",
    ) -> ProductListResponse:
        matched = self.store.search_products(query)
        plain_paths = set(self.store.get_leaf_paths_under(PLAIN_SHOP_PATH))
        matched = [
            p
            for p in matched
            if any(cp in plain_paths for cp in p.category_paths)
        ]
        sorted_products = self._product_service._sort_products(matched, sort)
        total = len(sorted_products)
        total_pages = max(1, math.ceil(total / per_page))
        page = max(1, min(page, total_pages))
        start = (page - 1) * per_page
        page_products = sorted_products[start : start + per_page]

        return ProductListResponse(
            products=[
                self._product_service._to_card(p) for p in page_products
            ],
            pagination=Pagination(
                page=page,
                per_page=per_page,
                total=total,
                total_pages=total_pages,
            ),
            facets=self._product_service._compute_facets(matched, matched),
            sort_options=["relevance", "price_asc", "price_desc", "rating", "discount"],
            applied_filters={"q": query, "sort": sort},
        )
