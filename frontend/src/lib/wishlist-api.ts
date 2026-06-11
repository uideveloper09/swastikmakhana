import { getStoredAuthToken } from "@/lib/auth-api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

function authHeaders(): HeadersInit {
  const token = getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGetWishlist(): Promise<string[] | null> {
  try {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.product_ids) ? data.product_ids : [];
  } catch {
    return null;
  }
}

export async function apiSetWishlist(
  productId: string,
  liked: boolean
): Promise<string[] | null> {
  try {
    const res = await fetch(`${API_BASE}/wishlist/set`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ product_id: productId, liked }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.product_ids) ? data.product_ids : [];
  } catch {
    return null;
  }
}

export async function apiSyncWishlist(productIds: string[]): Promise<string[] | null> {
  try {
    const res = await fetch(`${API_BASE}/wishlist/sync`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ product_ids: productIds }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.product_ids) ? data.product_ids : [];
  } catch {
    return null;
  }
}
