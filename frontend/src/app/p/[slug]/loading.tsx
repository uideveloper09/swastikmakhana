import { PageLoader } from "@/components/PageLoader";

export default function ProductLoading() {
  return (
    <div className="site-container py-10">
      <div className="page-loading-shell page-loading-shell-inline">
        <PageLoader label="Loading product…" />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="skeleton-block aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton-line h-4 w-24" />
          <div className="skeleton-line h-10 w-full max-w-md" />
          <div className="skeleton-line h-6 w-32" />
          <div className="skeleton-line h-8 w-40" />
          <div className="skeleton-line h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
