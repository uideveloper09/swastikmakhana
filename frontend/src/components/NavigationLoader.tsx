"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageLoader } from "./PageLoader";

function currentRouteKey(pathname: string, search: string) {
  return `${pathname}?${search}`;
}

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(false);
  }, [pathname, search]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      try {
        const next = new URL(href, window.location.origin);
        if (next.origin !== window.location.origin) return;

        const nextKey = currentRouteKey(next.pathname, next.searchParams.toString());
        const currentKey = currentRouteKey(pathname, search);
        if (nextKey !== currentKey) setNavigating(true);
      } catch {
        // ignore invalid URLs
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, search]);

  if (!navigating) return null;

  return (
    <div className="nav-loader-overlay" aria-hidden="true">
      <div className="nav-loader-bar" />
      <PageLoader label="Loading page…" size="md" />
    </div>
  );
}
