"use client";

import { useState } from "react";
import type { Facets } from "@/types/api";
import { FilterSidebar } from "./FilterSidebar";

interface MobileFilterDrawerProps {
  facets: Facets;
  total: number;
}

export function MobileFilterDrawer({ facets, total }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="category-mobile-filter-btn mb-4 flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold lg:hidden"
      >
        <span>☰</span> Filters & Sort
      </button>

      {open && (
        <div className="fixed inset-0 z-[55] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-theme">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-theme-muted hover:bg-linen-dark"
              >
                ✕
              </button>
            </div>
            <FilterSidebar
              facets={facets}
              total={total}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="hidden lg:block">
        <FilterSidebar facets={facets} total={total} />
      </div>
    </>
  );
}
