"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGetWishlist, apiSetWishlist, apiSyncWishlist } from "@/lib/wishlist-api";
import { loadLocalWishlist, saveLocalWishlist } from "@/lib/wishlist";

interface WishlistContextValue {
  ready: boolean;
  count: number;
  isLiked: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready: authReady } = useAuth();
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    async function hydrate() {
      const localIds = loadLocalWishlist();

      if (isAuthenticated) {
        const localBackup = [...localIds];
        const serverIds = (await apiGetWishlist()) ?? [];

        let merged = [...new Set([...serverIds, ...localIds])];
        if (localBackup.length > 0) {
          const synced = await apiSyncWishlist(localBackup);
          if (synced) merged = synced;
        }

        if (!cancelled) {
          setProductIds(new Set(merged));
          saveLocalWishlist(merged);
        }
      } else if (!cancelled) {
        setProductIds(new Set(localIds));
      }

      if (!cancelled) setReady(true);
    }

    setReady(false);
    hydrate();

    return () => {
      cancelled = true;
    };
  }, [authReady, isAuthenticated]);

  const toggle = useCallback(
    async (productId: string) => {
      let wasLiked = false;

      setProductIds((current) => {
        wasLiked = current.has(productId);
        const next = new Set(current);
        if (wasLiked) next.delete(productId);
        else next.add(productId);
        saveLocalWishlist([...next]);
        return next;
      });

      if (!isAuthenticated) return;

      const synced = await apiSetWishlist(productId, !wasLiked);
      if (synced) {
        setProductIds(new Set(synced));
        saveLocalWishlist(synced);
        return;
      }

      setProductIds((current) => {
        const reverted = new Set(current);
        if (wasLiked) reverted.add(productId);
        else reverted.delete(productId);
        saveLocalWishlist([...reverted]);
        return reverted;
      });
    },
    [isAuthenticated]
  );

  const isLiked = useCallback(
    (productId: string) => productIds.has(productId),
    [productIds]
  );

  const value = useMemo(
    () => ({
      ready,
      count: productIds.size,
      isLiked,
      toggle,
    }),
    [ready, productIds.size, isLiked, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
