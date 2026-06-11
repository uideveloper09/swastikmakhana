import "server-only";

import { readFile } from "fs/promises";
import path from "path";
import { PLAIN_PACK_SIZES, SHOP_CATEGORY_PATH } from "@/lib/brand";
import { CATEGORY_PER_PAGE } from "@/lib/filters";
import type { CategoryFilters, ProductCard, ProductDetail, ProductListResponse } from "@/types/api";

const SEED_PATH = path.join(process.cwd(), "..", "backend", "data", "seed.json");
const SORT_OPTIONS = ["relevance", "price_asc", "price_desc", "rating", "discount"] as const;

interface SeedProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  mrp: number;
  sale_price: number;
  discount_pct: number;
  rating: number;
  rating_count: number;
  pack_size: string;
  flavour: string;
  image_url: string;
  in_stock: boolean;
  category_paths: string[];
}

async function loadPlainProducts(): Promise<SeedProduct[]> {
  const raw = await readFile(SEED_PATH, "utf-8");
  const data = JSON.parse(raw) as { products: SeedProduct[] };
  return data.products.filter((p) =>
    p.category_paths.includes(SHOP_CATEGORY_PATH),
  );
}

function toCard(product: SeedProduct): ProductCard {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    mrp: product.mrp,
    sale_price: product.sale_price,
    discount_pct: product.discount_pct,
    rating: product.rating,
    rating_count: product.rating_count,
    pack_size: product.pack_size,
    flavour: product.flavour,
    image_url: product.image_url,
    in_stock: product.in_stock,
  };
}

function packSizeOrder(packSize: string): number {
  const index = PLAIN_PACK_SIZES.indexOf(packSize as (typeof PLAIN_PACK_SIZES)[number]);
  return index === -1 ? 999 : index;
}

function sortProducts(products: SeedProduct[], sort: string): SeedProduct[] {
  const list = [...products];
  switch (sort) {
    case "price_asc":
      return list.sort((a, b) => a.sale_price - b.sale_price);
    case "price_desc":
      return list.sort((a, b) => b.sale_price - a.sale_price);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    case "discount":
      return list.sort((a, b) => b.discount_pct - a.discount_pct);
    default:
      return list.sort((a, b) => packSizeOrder(a.pack_size) - packSizeOrder(b.pack_size));
  }
}

function applyFilters(products: SeedProduct[], filters: CategoryFilters): SeedProduct[] {
  let result = [...products];

  if (filters.brands?.length) {
    const brands = new Set(filters.brands);
    result = result.filter((p) => brands.has(p.brand));
  }
  if (filters.flavours?.length) {
    const flavours = new Set(filters.flavours);
    result = result.filter((p) => flavours.has(p.flavour));
  }
  if (filters.pack_sizes?.length) {
    const sizes = new Set(filters.pack_sizes);
    result = result.filter((p) => sizes.has(p.pack_size));
  }
  if (filters.price_min != null) {
    result = result.filter((p) => p.sale_price >= filters.price_min!);
  }
  if (filters.price_max != null) {
    result = result.filter((p) => p.sale_price <= filters.price_max!);
  }
  if (filters.discount_min != null) {
    result = result.filter((p) => p.discount_pct >= filters.discount_min!);
  }
  if (filters.discount_max != null) {
    result = result.filter((p) => p.discount_pct <= filters.discount_max!);
  }
  if (filters.rating_min != null) {
    result = result.filter((p) => p.rating >= filters.rating_min!);
  }
  if (filters.in_stock_only) {
    result = result.filter((p) => p.in_stock);
  }

  return result;
}

function facetCount(
  all: SeedProduct[],
  filtered: SeedProduct[],
  pick: (p: SeedProduct) => string,
): { value: string; count: number }[] {
  const allowed = new Set(filtered.map((p) => p.id));
  const counts = new Map<string, number>();
  for (const product of all) {
    if (!allowed.has(product.id)) continue;
    const value = pick(product);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

function matchesSearchQuery(product: SeedProduct, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    product.name,
    product.brand,
    product.pack_size,
    product.description,
    product.slug,
    product.flavour,
    "makhana",
    "fox nuts",
    "swastik",
  ]
    .join(" ")
    .toLowerCase();

  return q.split(/\s+/).every((term) => haystack.includes(term));
}

function buildProductListResponse(
  catalog: SeedProduct[],
  filters: CategoryFilters,
  appliedExtra: Record<string, unknown> = {},
): ProductListResponse {
  const filtered = applyFilters(catalog, filters);
  const sorted = sortProducts(filtered, filters.sort ?? "relevance");
  const perPage = CATEGORY_PER_PAGE;
  const page = Math.max(1, filters.page ?? 1);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const pageProducts = sorted.slice(start, start + perPage);

  const packFacetOrder = new Map(PLAIN_PACK_SIZES.map((size, index) => [size, index]));
  const packSizes = facetCount(catalog, filtered, (p) => p.pack_size).sort(
    (a, b) => (packFacetOrder.get(a.value as (typeof PLAIN_PACK_SIZES)[number]) ?? 99) -
      (packFacetOrder.get(b.value as (typeof PLAIN_PACK_SIZES)[number]) ?? 99),
  );

  return {
    products: pageProducts.map(toCard),
    pagination: {
      page: safePage,
      per_page: perPage,
      total,
      total_pages: totalPages,
    },
    facets: {
      brands: facetCount(catalog, filtered, (p) => p.brand),
      flavours: facetCount(catalog, filtered, (p) => p.flavour),
      pack_sizes: packSizes,
      price_ranges: [],
      discount_ranges: [],
    },
    sort_options: [...SORT_OPTIONS],
    applied_filters: {
      sort: filters.sort ?? "relevance",
      brands: filters.brands ?? [],
      flavours: filters.flavours ?? [],
      pack_sizes: filters.pack_sizes ?? [],
      price_min: filters.price_min ?? null,
      price_max: filters.price_max ?? null,
      discount_min: filters.discount_min ?? null,
      discount_max: filters.discount_max ?? null,
      rating_min: filters.rating_min ?? null,
      in_stock_only: filters.in_stock_only ?? false,
      ...appliedExtra,
    },
  };
}

export async function fetchPlainProductsFromSeed(
  filters: CategoryFilters = {},
): Promise<ProductListResponse> {
  const all = await loadPlainProducts();
  return buildProductListResponse(all, filters);
}

export async function searchPlainProductsFromSeed(
  query: string,
  page = 1,
  sort = "relevance",
): Promise<ProductListResponse> {
  const all = await loadPlainProducts();
  const matched = all.filter((product) => matchesSearchQuery(product, query));
  return buildProductListResponse(matched, { page, sort }, { q: query });
}

export async function fetchPlainProductFromSeed(slug: string): Promise<ProductDetail | null> {
  const all = await loadPlainProducts();
  const product = all.find((p) => p.slug === slug);
  if (!product) return null;
  return {
    ...toCard(product),
    description: product.description,
    category_paths: product.category_paths,
  };
}
