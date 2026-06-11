import { PLAIN_BRAND, PLAIN_PACK_SIZES, SHOP_CATEGORY_PATH } from "@/lib/brand";
import type { FacetItem } from "@/types/api";

function categoryPathFromPathname(pathname: string): string {
  return pathname.replace(/^\//, "");
}

export function brandsForCategoryPath(
  categoryPath: string,
  brands: FacetItem[],
): FacetItem[] {
  if (categoryPath !== SHOP_CATEGORY_PATH) {
    return brands;
  }

  const swastik = brands.find((item) => item.value === PLAIN_BRAND);
  return [{ value: PLAIN_BRAND, count: swastik?.count ?? 4 }];
}

export function brandsForPathname(pathname: string, brands: FacetItem[]): FacetItem[] {
  return brandsForCategoryPath(categoryPathFromPathname(pathname), brands);
}

export function packSizesForCategoryPath(
  categoryPath: string,
  packSizes: FacetItem[],
): FacetItem[] {
  if (categoryPath !== SHOP_CATEGORY_PATH) {
    return packSizes;
  }

  const counts = new Map(packSizes.map((item) => [item.value, item.count]));
  return PLAIN_PACK_SIZES.map((value) => ({
    value,
    count: counts.get(value) ?? 1,
  }));
}

export function packSizesForPathname(
  pathname: string,
  packSizes: FacetItem[],
): FacetItem[] {
  return packSizesForCategoryPath(categoryPathFromPathname(pathname), packSizes);
}
