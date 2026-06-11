interface PageLoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PageLoader({
  label = "Loading…",
  size = "md",
  className = "",
}: PageLoaderProps) {
  const dim =
    size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-11 w-11";

  return (
    <div className={`page-loader ${className}`} role="status" aria-live="polite" aria-busy="true">
      <div className={`page-loader-spinner ${dim}`} aria-hidden="true">
        <span className="page-loader-ring" />
        <span className="page-loader-core">S</span>
      </div>
      {label && <p className="page-loader-label">{label}</p>}
    </div>
  );
}
