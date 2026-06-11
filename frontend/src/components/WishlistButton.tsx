"use client";

import { useState } from "react";
import { useWishlist } from "@/contexts/WishlistContext";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ productId, className = "", size = "sm" }: WishlistButtonProps) {
  const { isLiked, toggle, ready } = useWishlist();
  const [busy, setBusy] = useState(false);
  const liked = ready && isLiked(productId);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await toggle(productId);
    } finally {
      setBusy(false);
    }
  };

  const dim = size === "md" ? "h-10 w-10" : "h-8 w-8";
  const icon = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`wishlist-btn ${liked ? "wishlist-btn-liked" : ""} ${dim} ${className}`}
      aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={liked}
    >
      <svg
        className={icon}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
