/** Images extracted from mithila-makhana.html reference */
export const IMAGES = {
  hero: "/images/hero.jpg",
  heritage: {
    main: "/images/category-1.jpg",
    accent: "/images/category-1.jpg",
  },
  categories: [
    "/images/category-1.jpg", // plain
    "/images/category-2.jpg", // roasted
    "/images/category-3.jpg", // masala
    "/images/category-4.jpg", // peri peri
    "/images/category-5.jpg", // chocolate
    "/images/category-6.jpg", // flavored mix
  ],
  /** Plain makhana product image — used for all live SKUs */
  plainProduct: "/images/category-1.jpg",
  /** Featured product cards — plain launch uses one image for every pack */
  featured: [
    "/images/category-1.jpg",
    "/images/category-1.jpg",
    "/images/category-1.jpg",
    "/images/category-1.jpg",
  ],
} as const;

const FLAVOUR_IMAGES: Record<string, string> = {
  natural: IMAGES.categories[0],
  Salted: IMAGES.categories[1],
  Pepper: IMAGES.categories[1],
  Masala: IMAGES.categories[2],
  "Peri Peri": IMAGES.categories[3],
  "Cream & Onion": IMAGES.categories[5],
  Cheese: IMAGES.categories[5],
};

const PLACEHOLDER_PREFIXES = ["/images/products/", "/images/product/"];

export function isPlaceholderImage(url: string | undefined | null): boolean {
  if (!url) return true;
  return PLACEHOLDER_PREFIXES.some((p) => url.startsWith(p));
}

export function getProductImageByFlavour(flavour?: string): string {
  if (flavour && FLAVOUR_IMAGES[flavour]) return FLAVOUR_IMAGES[flavour];
  return IMAGES.categories[0];
}

export function getProductImage(
  slug: string,
  index?: number,
  flavour?: string
): string {
  if (index !== undefined && index >= 0 && index < IMAGES.featured.length) {
    return IMAGES.featured[index]!;
  }
  if (flavour) return getProductImageByFlavour(flavour);

  if (slug.includes("plain-makhana") || slug.includes("thin-plain")) {
    return IMAGES.plainProduct;
  }

  const fallbackImages = [
    IMAGES.categories[0],
    IMAGES.categories[1],
    IMAGES.categories[2],
    IMAGES.categories[3],
    IMAGES.categories[5],
  ];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i)) % fallbackImages.length;
  }
  return fallbackImages[hash]!;
}

export function getFeaturedProductImage(index: number): string {
  return IMAGES.featured[index % IMAGES.featured.length]!;
}
