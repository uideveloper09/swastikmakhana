"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  perPage,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (total === 0) return null;

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) params.delete("page");
    else params.set("page", String(page));
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  };

  const rangeStart = (currentPage - 1) * perPage + 1;
  const rangeEnd = Math.min(currentPage * perPage, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="category-pagination-wrap">
      <p className="category-pagination-summary">
        Showing <span className="font-semibold text-theme">{rangeStart}–{rangeEnd}</span> of{" "}
        <span className="font-semibold text-theme">{total}</span> products
        {totalPages > 1 && (
          <span className="text-theme-muted">
            {" "}
            · Page {currentPage} of {totalPages}
          </span>
        )}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="category-pagination">
          {currentPage > 1 && (
            <Link href={buildPageUrl(currentPage - 1)} className="category-page-btn">
              ← Prev
            </Link>
          )}
          {pages.map((page, i) => {
            const prev = pages[i - 1];
            const showEllipsis = prev && page - prev > 1;
            return (
              <span key={page} className="flex items-center gap-1">
                {showEllipsis && <span className="px-2 text-theme-muted">…</span>}
                <Link
                  href={buildPageUrl(page)}
                  className={`category-page-btn ${page === currentPage ? "category-page-btn-active" : ""}`}
                >
                  {page}
                </Link>
              </span>
            );
          })}
          {currentPage < totalPages && (
            <Link href={buildPageUrl(currentPage + 1)} className="category-page-btn">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
