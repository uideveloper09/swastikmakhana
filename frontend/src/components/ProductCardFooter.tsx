"use client";

import type { ProductCard as ProductCardType } from "@/types/api";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardFooterProps {
  product: ProductCardType;
  layout?: "compact" | "listing";
}

export function ProductCardFooter({ product, layout = "compact" }: ProductCardFooterProps) {
  const { getQuantity } = useCart();
  const qty = getQuantity(product.id);
  const isListing = layout === "listing";

  return (
    <div
      className={`product-card-footer ${isListing ? "product-card-footer-listing px-4" : "px-3.5 sm:px-4"} ${qty > 0 ? "product-card-footer-in-cart" : ""}`}
    >
      <div className="product-card-price-block">
        <div className="product-card-price">
          <span className="product-card-price-main">{formatPrice(product.sale_price)}</span>
          {product.discount_pct > 0 && (
            <span className="product-card-price-mrp">{formatPrice(product.mrp)}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <AddToCartButton product={product} variant="pill" />
      </div>
    </div>
  );
}
