import type { CategoryFilters } from "@/types/api";

export const CATEGORY_PER_PAGE = 9;

export function parseFiltersFromSearchParams(
  params: Record<string, string | string[] | undefined>
): CategoryFilters {
  const getArray = (key: string): string[] | undefined => {
    const val = params[key];
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  };

  const getNumber = (key: string): number | undefined => {
    const val = params[key];
    if (!val || Array.isArray(val)) return undefined;
    const n = Number(val);
    return isNaN(n) ? undefined : n;
  };

  return {
    page: getNumber("page") ?? 1,
    sort: typeof params.sort === "string" ? params.sort : "relevance",
    brands: getArray("brands"),
    flavours: getArray("flavours"),
    pack_sizes: getArray("pack_sizes"),
    price_min: getNumber("price_min"),
    price_max: getNumber("price_max"),
    discount_min: getNumber("discount_min"),
    discount_max: getNumber("discount_max"),
    rating_min: getNumber("rating_min"),
    in_stock_only: params.in_stock_only === "true",
  };
}

export function buildFilterSearchParams(
  filters: CategoryFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.sort && filters.sort !== "relevance") params.set("sort", filters.sort);
  filters.brands?.forEach((b) => params.append("brands", b));
  filters.flavours?.forEach((f) => params.append("flavours", f));
  filters.pack_sizes?.forEach((p) => params.append("pack_sizes", p));
  if (filters.price_min) params.set("price_min", String(filters.price_min));
  if (filters.price_max) params.set("price_max", String(filters.price_max));
  if (filters.discount_min) params.set("discount_min", String(filters.discount_min));
  if (filters.discount_max) params.set("discount_max", String(filters.discount_max));
  if (filters.rating_min) params.set("rating_min", String(filters.rating_min));
  if (filters.in_stock_only) params.set("in_stock_only", "true");

  return params;
}

export const SORT_LABELS: Record<string, string> = {
  relevance: "Relevance",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  rating: "Top Rated",
  discount: "Best Discount",
};
