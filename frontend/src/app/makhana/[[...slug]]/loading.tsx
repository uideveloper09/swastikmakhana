import { PageLoader } from "@/components/PageLoader";

export default function CategoryLoading() {
  return (
    <div className="category-page">
      <div className="category-page-inner">
        <div className="skeleton-line mb-5 h-4 w-64" />
        <div className="category-hero animate-pulse">
          <div className="space-y-3">
            <div className="skeleton-line h-3 w-32" />
            <div className="skeleton-line h-10 w-56" />
            <div className="skeleton-line h-4 w-full max-w-xl" />
          </div>
          <div className="skeleton-line h-10 w-32 rounded-full" />
        </div>

        <div className="category-layout mt-8">
          <div className="hidden h-96 w-64 rounded-2xl lg:block skeleton-card" />
          <div className="flex-1">
            <div className="category-toolbar">
              <div className="page-loading-shell page-loading-shell-inline py-2">
                <PageLoader label="Loading products…" size="sm" />
              </div>
            </div>
            <div className="category-product-grid mt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-block aspect-square rounded-t-xl" />
                  <div className="space-y-2 p-4">
                    <div className="skeleton-line h-3 w-16" />
                    <div className="skeleton-line h-4 w-full" />
                    <div className="skeleton-line h-6 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
