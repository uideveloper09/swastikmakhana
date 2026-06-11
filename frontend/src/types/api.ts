export interface BreadcrumbItem {
  name: string;
  slug: string;
  path: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  level: number;
  path: string;
  is_leaf: boolean;
  meta_title?: string;
  meta_desc?: string;
}

export interface CategoryChild {
  id: string;
  slug: string;
  name: string;
  path: string;
  product_count: number;
}

export interface CategoryResolveResponse {
  category: Category;
  breadcrumbs: BreadcrumbItem[];
  children: CategoryChild[];
}

export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  brand: string;
  mrp: number;
  sale_price: number;
  discount_pct: number;
  rating: number;
  rating_count: number;
  pack_size: string;
  flavour: string;
  image_url: string;
  in_stock: boolean;
}

export interface FacetItem {
  value: string;
  count: number;
}

export interface PriceRangeFacet {
  label: string;
  min: number | null;
  max: number | null;
  count: number;
}

export interface DiscountRangeFacet {
  label: string;
  min: number;
  max: number | null;
  count: number;
}

export interface Facets {
  brands: FacetItem[];
  flavours: FacetItem[];
  pack_sizes: FacetItem[];
  price_ranges: PriceRangeFacet[];
  discount_ranges: DiscountRangeFacet[];
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ProductListResponse {
  products: ProductCard[];
  pagination: Pagination;
  facets: Facets;
  sort_options: string[];
  applied_filters: Record<string, unknown>;
}

export interface ProductDetail extends ProductCard {
  description: string;
  category_paths: string[];
}

export interface CategoryTreeNode {
  id: string;
  slug: string;
  name: string;
  path: string;
  level: number;
  is_leaf: boolean;
  children: CategoryTreeNode[];
}

export interface FeaturedCategory {
  id: string;
  name: string;
  path: string;
  product_count: number;
  description?: string;
}

export interface HomeStatsResponse {
  total_products: number;
  total_categories: number;
  featured_categories: FeaturedCategory[];
}

export interface CategoryFilters {
  page?: number;
  sort?: string;
  brands?: string[];
  flavours?: string[];
  pack_sizes?: string[];
  price_min?: number;
  price_max?: number;
  discount_min?: number;
  discount_max?: number;
  rating_min?: number;
  in_stock_only?: boolean;
}
