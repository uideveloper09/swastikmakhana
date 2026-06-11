import "server-only";

import type {
  CategoryFilters,
  CategoryResolveResponse,
  CategoryTreeNode,
  HomeStatsResponse,
  ProductDetail,
  ProductListResponse,
} from "@/types/api";
import { SHOP_CATEGORY_PATH } from "@/lib/brand";
import { CATEGORY_PER_PAGE } from "@/lib/filters";
import {
  fetchCategoryTreeFromSeed,
  resolveCategoryFromSeed,
} from "@/lib/seed-data";
import {
  fetchPlainProductFromSeed,
  fetchPlainProductsFromSeed,
  searchPlainProductsFromSeed,
} from "@/lib/seed-products";

function getApiBase(): string {
  const backend = (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    "http://127.0.0.1:8090"
  ).replace(/\/$/, "");
  return `${backend}/api/v1`;
}

function buildQuery(
  params: Record<string, string | number | boolean | string[] | undefined>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, v));
    } else {
      search.set(key, String(value));
    }
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function resolveCategory(
  path: string,
): Promise<CategoryResolveResponse | null> {
  return resolveCategoryFromSeed(path);
}

export async function fetchProducts(
  categoryPath: string,
  filters: CategoryFilters = {},
): Promise<ProductListResponse> {
  if (categoryPath === SHOP_CATEGORY_PATH) {
    return fetchPlainProductsFromSeed(filters);
  }

  const res = await fetch(
    `${getApiBase()}/products${buildQuery({
      category_path: categoryPath,
      page: filters.page,
      per_page: CATEGORY_PER_PAGE,
      sort: filters.sort,
      brands: filters.brands,
      flavours: filters.flavours,
      pack_sizes: filters.pack_sizes,
      price_min: filters.price_min,
      price_max: filters.price_max,
      discount_min: filters.discount_min,
      discount_max: filters.discount_max,
      rating_min: filters.rating_min,
      in_stock_only: filters.in_stock_only,
    })}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Failed to fetch products for: ${categoryPath}`);
  return res.json();
}

export async function fetchCategoryTree(): Promise<CategoryTreeNode[]> {
  return fetchCategoryTreeFromSeed();
}

export async function fetchHomeStats(): Promise<HomeStatsResponse> {
  const { products } = await fetchPlainProductsFromSeed();
  return {
    total_products: products.length,
    total_categories: 2,
    featured_categories: [
      {
        id: "cat-plain",
        name: "Plain Makhana",
        path: "makhana/plain-makhana",
        product_count: products.length,
        description: "Thin plain fox nuts in 100g–250g packs",
      },
    ],
  };
}

export async function searchProducts(
  query: string,
  page = 1,
  sort = "relevance",
): Promise<ProductListResponse> {
  return searchPlainProductsFromSeed(query, page, sort);
}

export async function fetchProduct(slug: string): Promise<ProductDetail | null> {
  const fromSeed = await fetchPlainProductFromSeed(slug);
  if (fromSeed) return fromSeed;

  const res = await fetch(`${getApiBase()}/products/${slug}`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch product: ${slug}`);
  return res.json();
}
