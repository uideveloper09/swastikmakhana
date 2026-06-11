import { PageLoader } from "@/components/PageLoader";

export default function SearchLoading() {
  return (
    <div className="site-container py-10">
      <div className="page-loading-shell page-loading-shell-inline">
        <PageLoader label="Searching products…" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
