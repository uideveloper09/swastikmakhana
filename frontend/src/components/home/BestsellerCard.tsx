"use client";

import Link from "next/link";
import type { ProductCard as ProductType } from "@/types/api";
import { ProductCardCartBadge } from "@/components/ProductCardCartBadge";
import { ProductCardFooter } from "@/components/ProductCardFooter";
import { ProductImage } from "@/components/ProductImage";
import { formatPackSize } from "@/lib/format-pack-size";
import { WishlistButton } from "@/components/WishlistButton";

interface BestsellerCardProps {
  product: ProductType;
}

export function BestsellerCard({ product }: BestsellerCardProps) {
  const isNewLaunch = product.pack_size === "250g";

  return (
    <article className="product-card-premium group relative flex flex-col">
      {isNewLaunch && (
        <div className="absolute left-2.5 top-2.5 z-10">
          <span
            className="product-card-badge text-midnight"
            style={{ background: "var(--accent-light)" }}
          >
            New
          </span>
        </div>
      )}

      <div className="relative">
        <Link href={`/p/${product.slug}`} className="block">
          <div className="product-card-image relative aspect-square overflow-hidden">
            <ProductImage
              product={product}
              className="transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
        <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5 z-10" />
        <ProductCardCartBadge productId={product.id} />
      </div>

      <div className="product-card-body product-card-body-tall">
        <Link href={`/p/${product.slug}`}>
          <h3 className="product-card-title transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <p className="product-card-meta">
          {formatPackSize(product.pack_size)} pack · {product.brand}
        </p>

        <div className="product-card-rating-row">
          <div className="product-card-rating">
            <span style={{ color: "var(--star)" }}>★</span>
            <span className="font-semibold text-theme">{product.rating.toFixed(1)}</span>
            <span className="text-theme-muted">({product.rating_count.toLocaleString()})</span>
          </div>
        </div>
      </div>

      <ProductCardFooter product={product} />
    </article>
  );
}
