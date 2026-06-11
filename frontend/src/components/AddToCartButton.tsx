"use client";

import type { ProductCard } from "@/types/api";
import { useCart } from "@/contexts/CartContext";

interface AddToCartButtonProps {
  product: ProductCard;
  size?: "sm" | "md";
  variant?: "default" | "pill";
}

export function AddToCartButton({ product, size = "sm", variant = "default" }: AddToCartButtonProps) {
  const { addItem, updateQuantity, getQuantity } = useCart();
  const qty = getQuantity(product.id);

  const btnClass =
    variant === "pill"
      ? "cart-add-btn"
      : size === "md"
        ? "rounded-md px-8 py-3 text-sm font-semibold uppercase tracking-wider"
        : "rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider";

  if (!product.in_stock) {
    return (
      <button
        type="button"
        className={`${btnClass} border text-theme-muted`}
        style={{ borderColor: "var(--border)" }}
        disabled
      >
        Notify
      </button>
    );
  }

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => addItem(product)}
        className={`${btnClass} bg-primary text-white transition hover:bg-primary-light`}
      >
        + Cart
      </button>
    );
  }

  const stepperClass =
    variant === "pill"
      ? "cart-qty-stepper cart-qty-stepper-pill"
      : `cart-qty-stepper ${size === "md" ? "cart-qty-stepper-md" : ""}`;

  return (
    <div className={stepperClass} role="group" aria-label="Quantity">
      <button
        type="button"
        onClick={() => updateQuantity(product.id, qty - 1)}
        className="cart-qty-stepper-btn"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <div className="cart-qty-stepper-value">
        <span className="cart-qty-stepper-label">Qty</span>
        <span className="cart-qty-stepper-count" aria-hidden="true">
          {qty}
        </span>
      </div>
      <button
        type="button"
        onClick={() => updateQuantity(product.id, qty + 1)}
        className="cart-qty-stepper-btn"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
