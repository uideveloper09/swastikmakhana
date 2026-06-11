"use client";

import { useCart } from "@/contexts/CartContext";

interface ProductCardCartBadgeProps {
  productId: string;
}

export function ProductCardCartBadge({ productId }: ProductCardCartBadgeProps) {
  const { getQuantity } = useCart();
  const qty = getQuantity(productId);

  if (qty === 0) return null;

  return (
    <span
      className={`product-card-qty-badge ${qty > 1 ? "product-card-qty-badge-multi" : ""}`}
      aria-label={`${qty} in cart`}
    >
      {qty > 1 ? `${qty} in cart` : "In cart"}
    </span>
  );
}
