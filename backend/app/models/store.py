from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Category:
    id: str
    slug: str
    name: str
    parent_id: str | None
    level: int
    path: str
    is_leaf: bool
    sort_order: int = 0
    meta_title: str | None = None
    meta_desc: str | None = None


@dataclass
class Product:
    id: str
    slug: str
    name: str
    brand: str
    description: str
    mrp: float
    sale_price: float
    discount_pct: int
    rating: float
    rating_count: int
    pack_size: str
    flavour: str
    image_url: str
    in_stock: bool
    category_paths: list[str] = field(default_factory=list)


class DataStore:
    def __init__(self, seed_path: Path) -> None:
        with seed_path.open(encoding="utf-8") as f:
            data = json.load(f)

        self.categories: dict[str, Category] = {}
        self.categories_by_path: dict[str, Category] = {}

        for item in data["categories"]:
            cat = Category(**item)
            self.categories[cat.id] = cat
            self.categories_by_path[cat.path] = cat

        self.products: dict[str, Product] = {}
        self.products_by_slug: dict[str, Product] = {}

        for item in data["products"]:
            prod = Product(**item)
            self.products[prod.id] = prod
            self.products_by_slug[prod.slug] = prod

    def get_children(self, parent_id: str | None) -> list[Category]:
        children = [c for c in self.categories.values() if c.parent_id == parent_id]
        return sorted(children, key=lambda c: c.sort_order)

    def get_leaf_paths_under(self, path: str) -> list[str]:
        cat = self.categories_by_path.get(path)
        if not cat:
            return []
        if cat.is_leaf:
            return [path]
        paths: list[str] = []
        for child in self.get_children(cat.id):
            paths.extend(self.get_leaf_paths_under(child.path))
        return paths

    def get_products_for_path(self, path: str) -> list[Product]:
        leaf_paths = set(self.get_leaf_paths_under(path))
        if not leaf_paths:
            return []
        seen: set[str] = set()
        result: list[Product] = []
        for product in self.products.values():
            if any(cp in leaf_paths for cp in product.category_paths):
                if product.id not in seen:
                    seen.add(product.id)
                    result.append(product)
        return result

    def search_products(self, query: str) -> list[Product]:
        q = query.lower().strip()
        if not q:
            return []
        results: list[Product] = []
        for product in self.products.values():
            haystack = " ".join(
                [product.name, product.brand, product.description, product.flavour]
            ).lower()
            if q in haystack:
                results.append(product)
        return results
