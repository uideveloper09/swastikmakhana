import "server-only";

import { readFile } from "fs/promises";
import path from "path";
import type {
  BreadcrumbItem,
  CategoryChild,
  CategoryResolveResponse,
  CategoryTreeNode,
} from "@/types/api";

interface SeedCategory {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  level: number;
  path: string;
  is_leaf: boolean;
  sort_order: number;
  meta_title?: string;
  meta_desc?: string;
}

interface SeedProduct {
  category_paths: string[];
}

interface SeedFile {
  categories: SeedCategory[];
  products: SeedProduct[];
}

let cachedSeed: SeedFile | null = null;

function getSeedPath(): string {
  return path.join(process.cwd(), "data", "seed.json");
}

async function loadSeed(): Promise<SeedFile> {
  if (cachedSeed) return cachedSeed;
  const raw = await readFile(getSeedPath(), "utf-8");
  cachedSeed = JSON.parse(raw) as SeedFile;
  return cachedSeed;
}

function getChildren(categories: SeedCategory[], parentId: string | null): SeedCategory[] {
  return categories
    .filter((cat) => cat.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function countProductsForPath(products: SeedProduct[], categoryPath: string): number {
  return products.filter((product) => product.category_paths.includes(categoryPath)).length;
}

function descendantPaths(categories: SeedCategory[], category: SeedCategory): string[] {
  const paths: string[] = [];
  for (const child of getChildren(categories, category.id)) {
    if (child.is_leaf) paths.push(child.path);
    else paths.push(...descendantPaths(categories, child));
  }
  return paths;
}

function buildBreadcrumbs(
  categories: SeedCategory[],
  category: SeedCategory,
): BreadcrumbItem[] {
  const byPath = new Map(categories.map((cat) => [cat.path, cat]));
  const segments = category.path.split("/");
  return segments.map((_, index) => {
    const partialPath = segments.slice(0, index + 1).join("/");
    const cat = byPath.get(partialPath)!;
    return { name: cat.name, slug: cat.slug, path: partialPath };
  });
}

function buildChildren(
  categories: SeedCategory[],
  products: SeedProduct[],
  category: SeedCategory,
): CategoryChild[] {
  return getChildren(categories, category.id).map((child) => {
    let productCount = countProductsForPath(products, child.path);
    if (!child.is_leaf) {
      for (const descPath of descendantPaths(categories, child)) {
        productCount += countProductsForPath(products, descPath);
      }
    }
    return {
      id: child.id,
      slug: child.slug,
      name: child.name,
      path: child.path,
      product_count: productCount,
    };
  });
}

function buildTreeNodes(
  categories: SeedCategory[],
  parentId: string | null,
): CategoryTreeNode[] {
  return getChildren(categories, parentId).map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    path: cat.path,
    level: cat.level,
    is_leaf: cat.is_leaf,
    children: buildTreeNodes(categories, cat.id),
  }));
}

export async function resolveCategoryFromSeed(
  categoryPath: string,
): Promise<CategoryResolveResponse | null> {
  const seed = await loadSeed();
  const category = seed.categories.find((cat) => cat.path === categoryPath);
  if (!category) return null;

  return {
    category: {
      id: category.id,
      slug: category.slug,
      name: category.name,
      level: category.level,
      path: category.path,
      is_leaf: category.is_leaf,
      meta_title: category.meta_title,
      meta_desc: category.meta_desc,
    },
    breadcrumbs: buildBreadcrumbs(seed.categories, category),
    children: buildChildren(seed.categories, seed.products, category),
  };
}

export async function fetchCategoryTreeFromSeed(): Promise<CategoryTreeNode[]> {
  const seed = await loadSeed();
  return buildTreeNodes(seed.categories, null);
}

export { loadSeed, getSeedPath };
