import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/types/api";
import { formatRatingCount } from "@/lib/api";
import { formatPackSize } from "@/lib/format-pack-size";
import { ProductCardCartBadge } from "./ProductCardCartBadge";
import { ProductCardFooter } from "./ProductCardFooter";
import { ProductImage } from "./ProductImage";
import { WishlistButton } from "./WishlistButton";

interface ProductCardProps {
  product: ProductCardType;
  layout?: "compact" | "listing";
}

export function ProductCard({ product, layout = "compact" }: ProductCardProps) {
  const isListing = layout === "listing";

  return (
    <article
      className={`product-card-premium group relative flex flex-col ${isListing ? "product-card-listing" : ""}`}
    >
      {product.discount_pct > 0 && (
        <span className="product-card-badge absolute left-3 top-3 z-10 bg-primary text-white">
          {product.discount_pct}% OFF
        </span>
      )}

      <div className="relative">
        <Link href={`/p/${product.slug}`} className="block">
          <div className="product-card-image relative aspect-square overflow-hidden">
            <ProductImage product={product} />
          </div>
        </Link>
        <WishlistButton
          productId={product.id}
          className={`absolute z-10 ${isListing ? "right-3 top-3" : "right-2.5 top-2.5"}`}
        />
        <ProductCardCartBadge productId={product.id} />
      </div>

      <div className={`product-card-body ${isListing ? "product-card-body-listing" : "product-card-body-tall"}`}>
        <p className="product-card-brand">{product.brand}</p>
        <Link href={`/p/${product.slug}`}>
          <h3 className="product-card-title mt-0.5 transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="product-card-rating-row gap-2">
          <div className="product-card-rating">
            <span style={{ color: "var(--star)" }}>★</span>
            <span className="font-semibold text-theme">{product.rating.toFixed(1)}</span>
            <span className="text-theme-muted">({formatRatingCount(product.rating_count)})</span>
          </div>
          <span className="product-card-pack">{formatPackSize(product.pack_size)} pack</span>
        </div>
      </div>

      <ProductCardFooter product={product} layout={layout} />
    </article>
  );
}
