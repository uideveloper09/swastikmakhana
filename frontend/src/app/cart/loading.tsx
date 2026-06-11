import { PageLoader } from "@/components/PageLoader";

export default function CartLoading() {
  return (
    <div className="site-container py-10">
      <div className="page-loading-shell page-loading-shell-inline">
        <PageLoader label="Loading cart…" />
      </div>
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-card flex gap-4 p-4">
            <div className="skeleton-block h-20 w-20 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-line h-4 w-3/4" />
              <div className="skeleton-line h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
