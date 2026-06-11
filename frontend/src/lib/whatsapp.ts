import { BRAND } from "@/lib/brand";
import type { CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

const WHATSAPP_NUMBER = BRAND.phone.replace(/\D/g, "");

export function buildCartOrderMessage(items: CartItem[], total: number): string {
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name} (${item.packSize}) × ${item.quantity} — ${formatPrice(item.salePrice * item.quantity)}`,
  );

  return [
    `Hi ${BRAND.name}! I'd like to place an order:`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
    "",
    "Please confirm availability and delivery.",
  ].join("\n");
}

export function getWhatsAppOrderUrl(items: CartItem[], total: number): string {
  const text = encodeURIComponent(buildCartOrderMessage(items, total));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
