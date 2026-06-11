"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SORT_LABELS } from "@/lib/filters";

export function AppliedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: { key: string; label: string; remove: () => void }[] = [];

  const removeParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value) {
      const all = params.getAll(key).filter((v) => v !== value);
      params.delete(key);
      all.forEach((v) => params.append(key, v));
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const sort = searchParams.get("sort");
  if (sort && sort !== "relevance") {
    chips.push({
      key: "sort",
      label: `Sort: ${SORT_LABELS[sort] || sort}`,
      remove: () => removeParam("sort"),
    });
  }

  searchParams.getAll("brands").forEach((b) =>
    chips.push({
      key: `brand-${b}`,
      label: b,
      remove: () => removeParam("brands", b),
    })
  );

  searchParams.getAll("flavours").forEach((f) =>
    chips.push({
      key: `flavour-${f}`,
      label: f,
      remove: () => removeParam("flavours", f),
    })
  );

  searchParams.getAll("pack_sizes").forEach((p) =>
    chips.push({
      key: `pack-${p}`,
      label: p,
      remove: () => removeParam("pack_sizes", p),
    })
  );

  if (searchParams.get("price_min") || searchParams.get("price_max")) {
    chips.push({
      key: "price",
      label: `₹${searchParams.get("price_min") || "0"} - ₹${searchParams.get("price_max") || "∞"}`,
      remove: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("price_min");
        params.delete("price_max");
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      },
    });
  }

  if (searchParams.get("discount_min")) {
    chips.push({
      key: "discount",
      label: `${searchParams.get("discount_min")}%+ off`,
      remove: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("discount_min");
        params.delete("discount_max");
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      },
    });
  }

  if (searchParams.get("rating_min")) {
    chips.push({
      key: "rating",
      label: `${searchParams.get("rating_min")}★+`,
      remove: () => removeParam("rating_min"),
    });
  }

  if (searchParams.get("in_stock_only") === "true") {
    chips.push({
      key: "stock",
      label: "In Stock",
      remove: () => removeParam("in_stock_only"),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="category-applied-filters">
      <span className="category-applied-label">Refined by</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="category-filter-chip"
        >
          {chip.label}
          <span aria-hidden>×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => router.push(pathname)}
        className="category-clear-filters"
      >
        Clear all
      </button>
    </div>
  );
}
