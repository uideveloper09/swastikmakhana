from app.models.store import Category, DataStore
from app.schemas.category import (
    BreadcrumbItem,
    CategoryBase,
    CategoryChild,
    CategoryResolveResponse,
    CategoryTreeNode,
)


class CategoryService:
    def __init__(self, store: DataStore) -> None:
        self.store = store

    def resolve_path(self, path: str) -> CategoryResolveResponse | None:
        category = self.store.categories_by_path.get(path)
        if not category:
            return None

        breadcrumbs = self._build_breadcrumbs(category)
        children = self._build_children(category)

        return CategoryResolveResponse(
            category=CategoryBase(
                id=category.id,
                slug=category.slug,
                name=category.name,
                level=category.level,
                path=category.path,
                is_leaf=category.is_leaf,
                meta_title=category.meta_title,
                meta_desc=category.meta_desc,
            ),
            breadcrumbs=breadcrumbs,
            children=children,
        )

    def get_tree(self) -> list[CategoryTreeNode]:
        return self._build_tree_nodes(parent_id=None)

    def _build_breadcrumbs(self, category: Category) -> list[BreadcrumbItem]:
        segments = category.path.split("/")
        crumbs: list[BreadcrumbItem] = []

        for i in range(len(segments)):
            partial_path = "/".join(segments[: i + 1])
            cat = self.store.categories_by_path[partial_path]
            crumbs.append(
                BreadcrumbItem(name=cat.name, slug=cat.slug, path=partial_path)
            )

        return crumbs

    def _build_children(self, category: Category) -> list[CategoryChild]:
        children = self.store.get_children(category.id)
        result: list[CategoryChild] = []

        for child in children:
            count = len(self.store.get_products_for_path(child.path))
            if not child.is_leaf:
                for desc in self._descendant_paths(child):
                    count += len(self.store.get_products_for_path(desc))
            result.append(
                CategoryChild(
                    id=child.id,
                    slug=child.slug,
                    name=child.name,
                    path=child.path,
                    product_count=count,
                )
            )

        return result

    def _descendant_paths(self, category: Category) -> list[str]:
        paths: list[str] = []
        for child in self.store.get_children(category.id):
            if child.is_leaf:
                paths.append(child.path)
            else:
                paths.extend(self._descendant_paths(child))
        return paths

    def _build_tree_nodes(self, parent_id: str | None) -> list[CategoryTreeNode]:
        nodes: list[CategoryTreeNode] = []
        for cat in self.store.get_children(parent_id):
            nodes.append(
                CategoryTreeNode(
                    id=cat.id,
                    slug=cat.slug,
                    name=cat.name,
                    path=cat.path,
                    level=cat.level,
                    is_leaf=cat.is_leaf,
                    children=self._build_tree_nodes(cat.id),
                )
            )
        return nodes
