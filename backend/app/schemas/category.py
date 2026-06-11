from pydantic import BaseModel, Field


class BreadcrumbItem(BaseModel):
    name: str
    slug: str
    path: str


class CategoryBase(BaseModel):
    id: str
    slug: str
    name: str
    level: int
    path: str
    is_leaf: bool
    meta_title: str | None = None
    meta_desc: str | None = None


class CategoryChild(BaseModel):
    id: str
    slug: str
    name: str
    path: str
    product_count: int = 0


class CategoryResolveResponse(BaseModel):
    category: CategoryBase
    breadcrumbs: list[BreadcrumbItem]
    children: list[CategoryChild] = Field(default_factory=list)


class CategoryTreeNode(BaseModel):
    id: str
    slug: str
    name: str
    path: str
    level: int
    is_leaf: bool
    children: list["CategoryTreeNode"] = Field(default_factory=list)


CategoryTreeNode.model_rebuild()
