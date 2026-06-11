"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/api";
import { BRAND, SHOP_URL } from "@/lib/brand";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import { ProductImage } from "@/components/ProductImage";

export default function CartPage() {
  const { items, total, count, updateQuantity, removeItem, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="site-container py-8 sm:py-10">
          <div className="cart-empty">
            <span className="cart-empty-icon" aria-hidden>
              🛒
            </span>
            <h1 className="cart-empty-title">Your cart is empty</h1>
            <p className="cart-empty-desc">
              Add premium plain makhana from {BRAND.name} and we&apos;ll keep
              everything ready to order on WhatsApp.
            </p>
            <Link href={SHOP_URL} className="premium-btn mt-8">
              Shop {BRAND.shortName}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="site-container py-6 sm:py-8">
        <header className="cart-hero">
          <div>
            <p className="cart-hero-eyebrow">Your Bag</p>
            <h1 className="cart-hero-title">Shopping Cart</h1>
            <p className="cart-hero-desc">
              {count} {count === 1 ? "item" : "items"} · Review before ordering
            </p>
          </div>
          <button type="button" onClick={clearCart} className="cart-clear-btn">
            Clear cart
          </button>
        </header>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article key={item.productId} className="cart-item-card">
                <Link href={`/p/${item.slug}`} className="cart-item-image">
                  <ProductImage
                    product={{
                      slug: item.slug,
                      name: item.name,
                      brand: item.brand,
                      image_url: item.imageUrl,
                      flavour: item.flavour ?? "natural",
                    }}
                    size="sm"
                  />
                </Link>

                <div className="cart-item-body">
                  <p className="cart-item-brand">{item.brand}</p>
                  <Link href={`/p/${item.slug}`} className="cart-item-title">
                    {item.name}
                  </Link>
                  <p className="cart-item-meta">{item.packSize}</p>
                  <p className="price-text price-text-sm mt-1 text-primary">
                    {formatPrice(item.salePrice)}
                  </p>
                </div>

                <div className="cart-item-actions">
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="cart-item-remove"
                  >
                    Remove
                  </button>
                  <div className="cart-qty-stepper cart-qty-stepper-md">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="cart-qty-stepper-btn"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="cart-qty-stepper-value">
                      <span className="cart-qty-stepper-count">{item.quantity}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="cart-qty-stepper-btn"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="price-text price-text-sm cart-item-line-total">
                    {formatPrice(item.salePrice * item.quantity)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal ({count} items)</span>
                <span className="price-text text-sm">{formatPrice(total)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Delivery</span>
                <span className="cart-summary-free">FREE</span>
              </div>
              <div className="cart-summary-total">
                <span>Total</span>
                <span className="price-text">{formatPrice(total)}</span>
              </div>
            </div>
            <a
              href={getWhatsAppOrderUrl(items, total)}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn cart-summary-checkout text-center"
            >
              Order on WhatsApp
            </a>
            <Link href={SHOP_URL} className="cart-summary-continue">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
