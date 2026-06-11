"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SORT_LABELS } from "@/lib/filters";

interface SortBarProps {
  sortOptions: string[];
  total: number;
  currentPage: number;
  totalPages: number;
}

function SortChevron() {
  return (
    <svg
      className="category-sort-chevron pointer-events-none h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function SortBar({
  sortOptions,
  total,
  currentPage,
  totalPages,
}: SortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "relevance";

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "relevance") params.delete("sort");
    else params.set("sort", sort);
    params.delete("page");
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    router.refresh();
  };

  return (
    <div className="category-sort-bar">
      <div className="category-sort-summary">
        <span className="category-sort-count-badge">{total}</span>
        <div className="category-sort-summary-copy">
          <span className="category-sort-summary-title">
            {total === 1 ? "Product" : "Products"}
          </span>
          {totalPages > 1 && (
            <span className="category-sort-summary-meta">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </div>

      <div className="category-sort-field">
        <label htmlFor="sort" className="category-sort-label">
          Sort by
        </label>
        <div className="category-sort-select-wrap">
          <select
            id="sort"
            value={currentSort}
            onChange={(e) => handleSort(e.target.value)}
            className="category-sort-select"
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>
                {SORT_LABELS[opt] || opt}
              </option>
            ))}
          </select>
          <SortChevron />
        </div>
      </div>
    </div>
  );
}
