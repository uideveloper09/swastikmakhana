import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { SortBar } from "@/components/SortBar";
import { searchProducts } from "@/lib/api-server";
import { BRAND, SHOP_CATEGORY_PATH, SHOP_URL, categoryUrl } from "@/lib/brand";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const SEARCH_SUGGESTIONS = [
  "100g",
  "150g",
  "200g",
  "250g",
  "thin",
] as const;

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  return { title: q ? `Search: ${q}` : "Search" };
}

function SearchPrompt() {
  return (
    <div className="search-empty">
      <span className="search-empty-icon" aria-hidden>
        🔍
      </span>
      <h1 className="search-empty-title">Search Products</h1>
      <p className="search-empty-desc">
        Use the search icon in the header to find {BRAND.name} thin plain makhana by name
        or pack size (100g, 150g, 200g, 250g).
      </p>
      <div className="search-suggestions">
        <p className="search-suggestions-label">Popular searches</p>
        <div className="search-suggestions-list">
          {SEARCH_SUGGESTIONS.map((term) => (
            <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="search-suggestion-pill">
              {term}
            </Link>
          ))}
        </div>
      </div>
      <Link href={SHOP_URL} className="premium-btn mt-8">
        Browse Plain Makhana
      </Link>
    </div>
  );
}

function SearchNoResults({ query }: { query: string }) {
  return (
    <div className="search-empty">
      <span className="search-empty-icon" aria-hidden>
        🪷
      </span>
      <h2 className="search-empty-title">No matches found</h2>
      <p className="search-empty-desc">
        We couldn&apos;t find any plain makhana for{" "}
        <span className="search-empty-query">&ldquo;{query}&rdquo;</span>. Try a different
        keyword or browse the full collection.
      </p>
      <div className="search-suggestions">
        <p className="search-suggestions-label">Try searching for</p>
        <div className="search-suggestions-list">
          {SEARCH_SUGGESTIONS.map((term) => (
            <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="search-suggestion-pill">
              {term}
            </Link>
          ))}
        </div>
      </div>
      <div className="search-empty-actions">
        <Link href={SHOP_URL} className="premium-btn">
          Shop Plain Makhana
        </Link>
        <Link href={categoryUrl(SHOP_CATEGORY_PATH)} className="btn-secondary">
          View All Products
        </Link>
      </div>
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const sort = typeof params.sort === "string" ? params.sort : "relevance";
  const page = Number(params.page) || 1;

  if (!q) {
    return (
      <div className="search-page">
        <div className="site-container py-8 sm:py-10">
          <SearchPrompt />
        </div>
      </div>
    );
  }

  const results = await searchProducts(q, page, sort);
  const hasResults = results.products.length > 0;

  return (
    <div className="search-page">
      <div className="site-container py-6 sm:py-8">
        <header className="search-hero">
          <div className="search-hero-copy">
            <p className="search-hero-eyebrow">Search Results</p>
            <h1 className="search-hero-title">
              Results for <span className="search-hero-query">&ldquo;{q}&rdquo;</span>
            </h1>
            <p className="search-hero-desc">
              {results.pagination.total === 0
                ? "No plain makhana matched your search."
                : `${results.pagination.total} ${results.pagination.total === 1 ? "product" : "products"} in plain makhana`}
            </p>
          </div>
          {hasResults && (
            <div className="search-hero-meta">
              <span className="category-count-badge">
                {results.pagination.total} found
              </span>
            </div>
          )}
        </header>

        {hasResults && (
          <div className="mt-6 category-toolbar">
            <Suspense fallback={null}>
              <SortBar
                sortOptions={results.sort_options}
                total={results.pagination.total}
                currentPage={results.pagination.page}
                totalPages={results.pagination.total_pages}
              />
            </Suspense>
          </div>
        )}

        {!hasResults ? (
          <SearchNoResults query={q} />
        ) : (
          <>
            <div className="search-product-grid">
              {results.products.map((product) => (
                <ProductCard key={product.id} product={product} layout="listing" />
              ))}
            </div>
            <Suspense fallback={null}>
              <Pagination
                currentPage={results.pagination.page}
                totalPages={results.pagination.total_pages}
                total={results.pagination.total}
                perPage={results.pagination.per_page}
              />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
