const WISHLIST_KEY = "swastik-wishlist";

export function loadLocalWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export function saveLocalWishlist(productIds: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...new Set(productIds)]));
}
