from pydantic import BaseModel, Field


class ProductCard(BaseModel):
    id: str
    slug: str
    name: str
    brand: str
    mrp: float
    sale_price: float
    discount_pct: int
    rating: float
    rating_count: int
    pack_size: str
    flavour: str
    image_url: str
    in_stock: bool


class FacetItem(BaseModel):
    value: str
    count: int


class PriceRangeFacet(BaseModel):
    label: str
    min: float | None
    max: float | None
    count: int


class DiscountRangeFacet(BaseModel):
    label: str
    min: int
    max: int | None
    count: int


class Facets(BaseModel):
    brands: list[FacetItem] = Field(default_factory=list)
    flavours: list[FacetItem] = Field(default_factory=list)
    pack_sizes: list[FacetItem] = Field(default_factory=list)
    price_ranges: list[PriceRangeFacet] = Field(default_factory=list)
    discount_ranges: list[DiscountRangeFacet] = Field(default_factory=list)


class Pagination(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int


class ProductListResponse(BaseModel):
    products: list[ProductCard]
    pagination: Pagination
    facets: Facets
    sort_options: list[str]
    applied_filters: dict = Field(default_factory=dict)


class ProductDetail(ProductCard):
    description: str
    category_paths: list[str]
