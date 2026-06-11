import { PageLoader } from "@/components/PageLoader";

export default function RootLoading() {
  return (
    <div className="page-loading-shell">
      <PageLoader label="Loading…" size="lg" />
    </div>
  );
}
