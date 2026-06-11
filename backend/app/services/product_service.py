from __future__ import annotations

import math
from typing import Any

from app.models.store import DataStore, Product
from app.schemas.product import (
    DiscountRangeFacet,
    FacetItem,
    Facets,
    Pagination,
    PriceRangeFacet,
    ProductCard,
    ProductDetail,
    ProductListResponse,
)

SORT_OPTIONS = ["relevance", "price_asc", "price_desc", "rating", "discount"]

PRICE_RANGES: list[tuple[str, float | None, float | None]] = [
    ("Less than ₹50", None, 50),
    ("₹51 to ₹100", 51, 100),
    ("₹101 to ₹200", 101, 200),
    ("₹201 to ₹500", 201, 500),
    ("More than ₹500", 500, None),
]

DISCOUNT_RANGES: list[tuple[str, int, int | None]] = [
    ("Upto 5%", 0, 5),
    ("5% - 10%", 5, 10),
    ("10% - 15%", 10, 15),
    ("15% - 25%", 15, 25),
    ("More than 25%", 25, None),
]


class ProductService:
    def __init__(self, store: DataStore) -> None:
        self.store = store

    def list_products(
        self,
        category_path: str,
        page: int = 1,
        per_page: int = 48,
        sort: str = "relevance",
        brands: list[str] | None = None,
        flavours: list[str] | None = None,
        pack_sizes: list[str] | None = None,
        price_min: float | None = None,
        price_max: float | None = None,
        discount_min: int | None = None,
        discount_max: int | None = None,
        rating_min: float | None = None,
        in_stock_only: bool = False,
    ) -> ProductListResponse | None:
        if category_path not in self.store.categories_by_path:
            return None

        all_products = self.store.get_products_for_path(category_path)
        filtered = self._apply_filters(
            all_products,
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

        sorted_products = self._sort_products(filtered, sort)
        total = len(sorted_products)
        total_pages = max(1, math.ceil(total / per_page))
        page = max(1, min(page, total_pages))
        start = (page - 1) * per_page
        page_products = sorted_products[start : start + per_page]

        return ProductListResponse(
            products=[self._to_card(p) for p in page_products],
            pagination=Pagination(
                page=page,
                per_page=per_page,
                total=total,
                total_pages=total_pages,
            ),
            facets=self._compute_facets(all_products, filtered),
            sort_options=SORT_OPTIONS,
            applied_filters={
                "sort": sort,
                "brands": brands or [],
                "flavours": flavours or [],
                "pack_sizes": pack_sizes or [],
                "price_min": price_min,
                "price_max": price_max,
                "discount_min": discount_min,
                "discount_max": discount_max,
                "rating_min": rating_min,
                "in_stock_only": in_stock_only,
            },
        )

    def get_product(self, slug: str) -> ProductDetail | None:
        product = self.store.products_by_slug.get(slug)
        if not product:
            return None
        return ProductDetail(
            **self._to_card(product).model_dump(),
            description=product.description,
            category_paths=product.category_paths,
        )

    def _apply_filters(
        self,
        products: list[Product],
        **filters: Any,
    ) -> list[Product]:
        result = products

        if filters.get("brands"):
            brands = set(filters["brands"])
            result = [p for p in result if p.brand in brands]

        if filters.get("flavours"):
            flavours = set(filters["flavours"])
            result = [p for p in result if p.flavour in flavours]

        if filters.get("pack_sizes"):
            sizes = set(filters["pack_sizes"])
            result = [p for p in result if p.pack_size in sizes]

        if filters.get("price_min") is not None:
            result = [p for p in result if p.sale_price >= filters["price_min"]]

        if filters.get("price_max") is not None:
            result = [p for p in result if p.sale_price <= filters["price_max"]]

        if filters.get("discount_min") is not None:
            result = [p for p in result if p.discount_pct >= filters["discount_min"]]

        if filters.get("discount_max") is not None:
            result = [p for p in result if p.discount_pct <= filters["discount_max"]]

        if filters.get("rating_min") is not None:
            result = [p for p in result if p.rating >= filters["rating_min"]]

        if filters.get("in_stock_only"):
            result = [p for p in result if p.in_stock]

        return result

    def _sort_products(self, products: list[Product], sort: str) -> list[Product]:
        if sort == "price_asc":
            return sorted(products, key=lambda p: p.sale_price)
        if sort == "price_desc":
            return sorted(products, key=lambda p: p.sale_price, reverse=True)
        if sort == "rating":
            return sorted(products, key=lambda p: (p.rating, p.rating_count), reverse=True)
        if sort == "discount":
            return sorted(products, key=lambda p: p.discount_pct, reverse=True)
        return sorted(
            products,
            key=lambda p: (p.in_stock, p.rating_count, p.rating),
            reverse=True,
        )

    def _compute_facets(
        self, all_products: list[Product], filtered: list[Product]
    ) -> Facets:
        return Facets(
            brands=self._facet_count(all_products, filtered, lambda p: p.brand),
            flavours=self._facet_count(all_products, filtered, lambda p: p.flavour),
            pack_sizes=self._facet_count(all_products, filtered, lambda p: p.pack_size),
            price_ranges=self._price_range_facets(all_products, filtered),
            discount_ranges=self._discount_range_facets(all_products, filtered),
        )

    def _facet_count(
        self,
        all_products: list[Product],
        filtered: list[Product],
        key_fn: Any,
    ) -> list[FacetItem]:
        values = sorted({key_fn(p) for p in all_products})
        items: list[FacetItem] = []
        for value in values:
            count = sum(1 for p in filtered if key_fn(p) == value)
            items.append(FacetItem(value=value, count=count))
        return sorted(items, key=lambda x: x.count, reverse=True)

    def _price_range_facets(
        self, all_products: list[Product], filtered: list[Product]
    ) -> list[PriceRangeFacet]:
        facets: list[PriceRangeFacet] = []
        for label, min_p, max_p in PRICE_RANGES:
            count = sum(
                1
                for p in filtered
                if self._in_price_range(p.sale_price, min_p, max_p)
            )
            facets.append(
                PriceRangeFacet(label=label, min=min_p, max=max_p, count=count)
            )
        return facets

    def _discount_range_facets(
        self, all_products: list[Product], filtered: list[Product]
    ) -> list[DiscountRangeFacet]:
        facets: list[DiscountRangeFacet] = []
        for label, min_d, max_d in DISCOUNT_RANGES:
            count = sum(
                1
                for p in filtered
                if self._in_discount_range(p.discount_pct, min_d, max_d)
            )
            facets.append(
                DiscountRangeFacet(label=label, min=min_d, max=max_d, count=count)
            )
        return facets

    @staticmethod
    def _in_price_range(price: float, min_p: float | None, max_p: float | None) -> bool:
        if min_p is not None and price < min_p:
            return False
        if max_p is not None and price > max_p:
            return False
        return True

    @staticmethod
    def _in_discount_range(
        discount: int, min_d: int, max_d: int | None
    ) -> bool:
        if discount < min_d:
            return False
        if max_d is not None and discount > max_d:
            return False
        return True

    @staticmethod
    def _to_card(product: Product) -> ProductCard:
        return ProductCard(
            id=product.id,
            slug=product.slug,
            name=product.name,
            brand=product.brand,
            mrp=product.mrp,
            sale_price=product.sale_price,
            discount_pct=product.discount_pct,
            rating=product.rating,
            rating_count=product.rating_count,
            pack_size=product.pack_size,
            flavour=product.flavour,
            image_url=product.image_url,
            in_stock=product.in_stock,
        )
