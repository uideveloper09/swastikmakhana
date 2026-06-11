"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { brandsForPathname, packSizesForPathname } from "@/lib/pack-sizes";
import type { Facets } from "@/types/api";

interface FilterSidebarProps {
  facets: Facets;
  total: number;
  onClose?: () => void;
}

export function FilterSidebar({ facets, total, onClose }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllPackSizes, setShowAllPackSizes] = useState(false);

  const navigate = useCallback(
    (params: URLSearchParams) => {
      params.delete("page");
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
      onClose?.();
    },
    [router, pathname, onClose]
  );

  const getSelected = useCallback(
    (key: string): string[] => searchParams.getAll(key),
    [searchParams]
  );

  const toggleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);
    params.delete(key);
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      [...current, value].forEach((v) => params.append(key, v));
    }
    navigate(params);
  };

  const togglePriceRange = (min: number | null, max: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    const isActive =
      searchParams.get("price_min") === String(min ?? "") &&
      searchParams.get("price_max") === String(max ?? "");
    if (isActive) {
      params.delete("price_min");
      params.delete("price_max");
    } else {
      if (min !== null) params.set("price_min", String(min));
      else params.delete("price_min");
      if (max !== null) params.set("price_max", String(max));
      else params.delete("price_max");
    }
    navigate(params);
  };

  const toggleDiscountRange = (min: number, max: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    const isActive =
      searchParams.get("discount_min") === String(min) &&
      searchParams.get("discount_max") === String(max ?? "");
    if (isActive) {
      params.delete("discount_min");
      params.delete("discount_max");
    } else {
      params.set("discount_min", String(min));
      if (max) params.set("discount_max", String(max));
      else params.delete("discount_max");
    }
    navigate(params);
  };

  const toggleRating = (min: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchParams.get("rating_min") === String(min)) {
      params.delete("rating_min");
    } else {
      params.set("rating_min", String(min));
    }
    navigate(params);
  };

  const toggleInStock = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchParams.get("in_stock_only") === "true") {
      params.delete("in_stock_only");
    } else {
      params.set("in_stock_only", "true");
    }
    navigate(params);
  };

  const clearFilters = () => {
    router.push(pathname);
    onClose?.();
  };

  const hasFilters = searchParams.toString().length > 0;
  const brands = brandsForPathname(pathname, facets.brands);
  const brandList = showAllBrands ? brands : brands.slice(0, 10);
  const packSizes = packSizesForPathname(pathname, facets.pack_sizes);
  const packList = showAllPackSizes ? packSizes : packSizes.slice(0, 8);

  return (
    <aside className="category-filter-sidebar w-full shrink-0 lg:w-64">
      <div className="category-filter-panel sticky top-24">
        <div className="category-filter-header">
          <div className="category-filter-header-main">
            <span className="category-filter-icon" aria-hidden>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0h3.75"
                />
              </svg>
            </span>
            <div>
              <h2 className="category-filter-title">Filters</h2>
              <p className="category-filter-subtitle">{total} products</p>
            </div>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="category-filter-clear"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="category-filter-sections">
        <FilterSection title="Availability">
          <FilterCheckbox
            label="In Stock Only"
            count={total}
            checked={searchParams.get("in_stock_only") === "true"}
            onChange={toggleInStock}
          />
        </FilterSection>

        <FilterSection title="Product Rating">
          {[4, 3].map((rating) => (
            <FilterCheckbox
              key={rating}
              label={`${rating}★ & above`}
              count={
                facets.brands.length > 0
                  ? facets.brands.reduce((s, b) => s + b.count, 0)
                  : total
              }
              checked={searchParams.get("rating_min") === String(rating)}
              onChange={() => toggleRating(rating)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Brands">
          {brandList.map((item) => (
            <FilterCheckbox
              key={item.value}
              label={item.value}
              count={item.count}
              checked={getSelected("brands").includes(item.value)}
              onChange={() => toggleFilter("brands", item.value)}
            />
          ))}
          {brands.length > 10 && (
            <button
              type="button"
              onClick={() => setShowAllBrands(!showAllBrands)}
              className="category-filter-more"
            >
              {showAllBrands ? "Show less" : `Show more +`}
            </button>
          )}
        </FilterSection>

        <FilterSection title="Price">
          {facets.price_ranges.map((range) => (
            <FilterCheckbox
              key={range.label}
              label={range.label}
              count={range.count}
              checked={
                searchParams.get("price_min") === String(range.min ?? "") &&
                searchParams.get("price_max") === String(range.max ?? "")
              }
              onChange={() => togglePriceRange(range.min, range.max)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Discount">
          {facets.discount_ranges.map((range) => (
            <FilterCheckbox
              key={range.label}
              label={range.label}
              count={range.count}
              checked={
                searchParams.get("discount_min") === String(range.min) &&
                searchParams.get("discount_max") === String(range.max ?? "")
              }
              onChange={() => toggleDiscountRange(range.min, range.max)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Flavours">
          {facets.flavours.map((item) => (
            <FilterCheckbox
              key={item.value}
              label={item.value}
              count={item.count}
              checked={getSelected("flavours").includes(item.value)}
              onChange={() => toggleFilter("flavours", item.value)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Pack Size">
          {packList.map((item) => (
            <FilterCheckbox
              key={item.value}
              label={item.value}
              count={item.count}
              checked={getSelected("pack_sizes").includes(item.value)}
              onChange={() => toggleFilter("pack_sizes", item.value)}
            />
          ))}
          {packSizes.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllPackSizes(!showAllPackSizes)}
              className="category-filter-more"
            >
              {showAllPackSizes ? "Show less" : `Show more +`}
            </button>
          )}
        </FilterSection>
        </div>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="category-filter-section">
      <h3 className="category-filter-section-title">
        <span className="category-filter-section-dot" aria-hidden />
        {title}
      </h3>
      <div className="category-filter-section-body">{children}</div>
    </section>
  );
}

function FilterCheckbox({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  if (count === 0 && !checked) return null;

  return (
    <label className="category-filter-option">
      <input
        type="checkbox"
        className="filter-checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="category-filter-option-label">{label}</span>
      {count > 0 && (
        <span className="category-filter-option-count">{count}</span>
      )}
    </label>
  );
}
