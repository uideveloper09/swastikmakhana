from pydantic import BaseModel, Field


class FeaturedCategory(BaseModel):
    id: str
    name: str
    path: str
    product_count: int
    description: str | None = None


class HomeStatsResponse(BaseModel):
    total_products: int
    total_categories: int
    featured_categories: list[FeaturedCategory] = Field(default_factory=list)
