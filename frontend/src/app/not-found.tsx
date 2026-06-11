import Link from "next/link";
import { BRAND, SHOP_URL } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="search-page">
      <div className="site-container py-8 sm:py-10">
        <div className="search-empty">
          <span className="search-empty-icon" aria-hidden>
            🪷
          </span>
          <h1 className="search-empty-title">Page Not Found</h1>
          <p className="search-empty-desc">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <div className="search-empty-actions">
            <Link href="/" className="premium-btn">
              Go Home
            </Link>
            <Link href={SHOP_URL} className="btn-secondary">
              Shop {BRAND.shortName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
