import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AppliedFilters } from "@/components/AppliedFilters";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MakhanaTypeGrid } from "@/components/MakhanaTypeGrid";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { SortBar } from "@/components/SortBar";
import { SubcategoryNav } from "@/components/SubcategoryNav";
import { fetchProducts, resolveCategory } from "@/lib/api-server";
import { categorySlugToPath, pathToUrl } from "@/lib/paths";
import {
  isActiveMakhanaTypePath,
  isShopCategoryPath,
  MAHANA_ROOT_PATH,
  MAKHANA_TYPES,
  SHOP_CATEGORIES,
  SHOP_URL,
} from "@/lib/brand";
import { parseFiltersFromSearchParams } from "@/lib/filters";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = categorySlugToPath(slug);
  if (!isShopCategoryPath(path)) redirect(SHOP_URL);

  const resolved = await resolveCategory(path);
  if (!resolved) return { title: "Category Not Found" };

  return {
    title: resolved.category.meta_title || resolved.category.name,
    description: resolved.category.meta_desc,
    alternates: { canonical: pathToUrl(path) },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const path = categorySlugToPath(slug);
  if (!isShopCategoryPath(path)) redirect(SHOP_URL);

  const resolved = await resolveCategory(path);
  if (!resolved) notFound();

  const isShopHub = path === MAHANA_ROOT_PATH;

  if (!isShopHub && !isActiveMakhanaTypePath(path)) {
    redirect(SHOP_URL);
  }

  const rootCategory = isShopHub
    ? resolved
    : await resolveCategory(MAHANA_ROOT_PATH);
  const catalogPaths = new Set<string>(MAKHANA_TYPES.map((cat) => cat.path));
  const catalogOrder = new Map<string, number>(
    MAKHANA_TYPES.map((cat, index) => [cat.path, index]),
  );
  const allMakhanaTypes =
    rootCategory?.children
      .filter((child) => catalogPaths.has(child.path))
      .sort(
        (a, b) =>
          (catalogOrder.get(a.path) ?? 0) - (catalogOrder.get(b.path) ?? 0),
      ) ?? [];
  const makhanaTypes = allMakhanaTypes.filter((child) =>
    SHOP_CATEGORIES.some((cat) => cat.path === child.path),
  );

  const filters = parseFiltersFromSearchParams(query);
  const productData = isShopHub
    ? null
    : await fetchProducts(path, filters);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://swastikmakhana.com/" },
      ...resolved.breadcrumbs.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: crumb.name,
        item: `https://swastikmakhana.com${pathToUrl(crumb.path)}`,
      })),
    ],
  };

  return (
    <div className="category-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="category-page-inner">
        <Breadcrumbs items={resolved.breadcrumbs} />

        <header className="category-hero">
          <div className="category-hero-copy">
            <p className="category-hero-eyebrow">
              {isShopHub ? "Shop Collection" : "Premium Collection"}
            </p>
            <h1 className="category-hero-title">{resolved.category.name}</h1>
            {resolved.category.meta_desc && (
              <p className="category-hero-desc">{resolved.category.meta_desc}</p>
            )}
          </div>
          {!isShopHub && productData && (
            <div className="category-hero-meta">
              <span className="category-count-badge">
                {productData.pagination.total} products
              </span>
            </div>
          )}
        </header>

        {isShopHub ? (
          <div className="mt-8 space-y-10">
            <div>
              <div className="mb-5">
                <h2 className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-theme">
                  Shop Now
                </h2>
                <p className="mt-1 text-sm text-theme-muted">
                  Thin plain makhana — available in 100g, 150g, 200g & 250g packs
                </p>
              </div>
              <MakhanaTypeGrid types={makhanaTypes} />
            </div>

            <div>
              <div className="mb-5">
                <h2 className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-theme">
                  Coming Soon
                </h2>
                <p className="mt-1 text-sm text-theme-muted">
                  New flavours launching next — stay tuned
                </p>
              </div>
              <MakhanaTypeGrid
                types={allMakhanaTypes.filter(
                  (child) => !makhanaTypes.some((live) => live.path === child.path),
                )}
              />
            </div>
          </div>
        ) : (
          <>
            <SubcategoryNav
              items={makhanaTypes}
              currentPath={path}
              parentPath={MAHANA_ROOT_PATH}
              parentLabel="All Makhana"
            />

            <div className="category-layout">
              <Suspense
                fallback={
                  <div className="category-filter-skeleton hidden h-96 w-full animate-pulse rounded-2xl lg:block lg:w-64" />
                }
              >
                <MobileFilterDrawer
                  facets={productData!.facets}
                  total={productData!.pagination.total}
                />
              </Suspense>

              <div className="category-main">
                <div className="category-toolbar">
                  <Suspense fallback={null}>
                    <SortBar
                      sortOptions={productData!.sort_options}
                      total={productData!.pagination.total}
                      currentPage={productData!.pagination.page}
                      totalPages={productData!.pagination.total_pages}
                    />
                  </Suspense>

                  <Suspense fallback={null}>
                    <AppliedFilters />
                  </Suspense>
                </div>

                {productData!.products.length === 0 ? (
                  <div className="category-empty">
                    <span className="text-4xl">🪷</span>
                    <p className="mt-4 font-display text-xl font-semibold text-theme">
                      No products match your filters
                    </p>
                    <p className="mt-2 text-sm text-theme-muted">
                      Try clearing filters or adjusting your selection.
                    </p>
                  </div>
                ) : (
                  <div className="category-product-grid">
                    {productData!.products.map((product) => (
                      <ProductCard key={product.id} product={product} layout="listing" />
                    ))}
                  </div>
                )}

                <Suspense fallback={null}>
                  <Pagination
                    currentPage={productData!.pagination.page}
                    totalPages={productData!.pagination.total_pages}
                    total={productData!.pagination.total}
                    perPage={productData!.pagination.per_page}
                  />
                </Suspense>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
