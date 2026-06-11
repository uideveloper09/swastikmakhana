import type { ProductCard } from "@/types/api";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  salePrice: number;
  mrp: number;
  packSize: string;
  imageUrl: string;
  flavour?: string;
  inStock: boolean;
  quantity: number;
}

const CART_KEY = "makhana-cart";

export function productToCartItem(product: ProductCard, quantity = 1): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    salePrice: product.sale_price,
    mrp: product.mrp,
    packSize: product.pack_size,
    imageUrl: product.image_url,
    flavour: product.flavour,
    inStock: product.in_stock,
    quantity,
  };
}

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
