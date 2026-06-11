export const BRAND = {
  name: "Swastik Makhana",
  shortName: "Swastik",
  tagline: "Pure Fox Nuts from Bihar's Finest Farms",
  heroTagline: "शुद्ध स्वाद · स्वस्थ जीवन · सीधे बिहार से",
  heroHeading: "Pure. Natural. Wholesome.",
  description:
    "Handpicked thin plain phool makhana from Bihar's wetlands — 100g, 150g, 200g & 250g packs, delivered fresh to your home.",
  logoLetter: "S",
  email: "hello@swastikmakhana.com",
  phone: "+91 96677 10954",
  address: "Makhana Farm, Darbhanga, Bihar 846004",
} as const;

export const ANNOUNCEMENTS = [
  "100% Natural",
  "Premium Quality",
  "Direct from Bihar",
  "SWASTIK10",
] as const;

/** Replace with your live listing URLs when available */
export const MARKETPLACES = [
  {
    name: "Amazon",
    url: "https://www.amazon.in/s?k=swastik+thin+plain+makhana",
  },
  {
    name: "Flipkart",
    url: "https://www.flipkart.com/search?q=swastik+makhana",
  },
  {
    name: "Meesho",
    url: "https://www.meesho.com/search?q=swastik%20makhana",
  },
] as const;

export const DELIVERY_INFO = {
  chipTitle: "Delivery in NCR",
  defaultArea: "Delhi NCR",
  serviceNote: "Website delivery available in Delhi NCR only",
  marketplaceNote: "Pan-India on Amazon, Flipkart & Meesho",
  ncrAreas: ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Faridabad"] as const,
} as const;

export const TRUST_FEATURES = [
  { icon: "🚚", title: "NCR Delivery", desc: "Free on orders above ₹499" },
  { icon: "🔒", title: "Secure Payment", desc: "100% Safe & Secure" },
  { icon: "🏆", title: "Premium Quality", desc: "Handpicked with Care" },
  { icon: "❤️", title: "Happy Customers", desc: "Trusted by Thousands" },
] as const;

export const WHY_CHOOSE = [
  {
    title: "Source-to-Shelf Traceability",
    desc: "Every batch traceable to the farmer's wetland in Bihar. Radical transparency.",
    icon: "✓",
  },
  {
    title: "Zero Artificial Additives",
    desc: "No preservatives, no colours, no MSG. Pure makhana as nature intended.",
    icon: "✓",
  },
  {
    title: "GI-Tagged Premium Grade",
    desc: "Only GI-tagged Swastik Makhana — finest grade from Darbhanga wetlands.",
    icon: "✓",
  },
  {
    title: "Supporting Local Farmers",
    desc: "Direct partnerships with 200+ farming families across Bihar.",
    icon: "✓",
  },
] as const;

export const REVIEWS = [
  {
    name: "Rahul Verma",
    location: "Delhi",
    rating: 5,
    text: "The thin plain makhana is so light and crisp — perfect for evening snacking. Ordered the 200g pack twice already. Packaging keeps it fresh!",
    avatar: "#6B4226",
  },
  {
    name: "Dr. Anjali Mishra",
    location: "Bangalore",
    rating: 5,
    text: "As a nutritionist, I'm thrilled to recommend a makhana brand I trust. High protein, zero junk, and they support local farmers. Incredible!",
    avatar: "#8B5E3C",
  },
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The crunch is incredible! Best plain makhana I've ever had. My whole family loves the 150g pack. Swastik is now a pantry staple!",
    avatar: "#5A3A28",
  },
] as const;

export const MAHANA_ROOT_PATH = "makhana";
export const SHOP_CATEGORY_PATH = "makhana/plain-makhana";
export const SHOP_URL = "/makhana";

/** Active plain makhana pack sizes — must match backend seed.json */
export const PLAIN_PACK_SIZES = ["100g", "150g", "200g", "250g"] as const;

/** Only brand on site for plain makhana launch */
export const PLAIN_BRAND = BRAND.shortName;

export function isShopCategoryPath(path: string): boolean {
  return path === MAHANA_ROOT_PATH || path === SHOP_CATEGORY_PATH;
}

export type MakhanaTypeStatus = "live" | "coming_soon";

export const MAKHANA_TYPES = [
  {
    name: "Plain Makhana",
    slug: "plain-makhana",
    path: "makhana/plain-makhana",
    sub: "100g · 150g · 200g · 250g",
    emoji: "🪷",
    imageIndex: 0,
    status: "live",
  },
  {
    name: "Roasted Makhana",
    slug: "roasted-makhana",
    path: "makhana/roasted-makhana",
    sub: "Light & crunchy",
    emoji: "🔥",
    imageIndex: 1,
    status: "coming_soon",
  },
  {
    name: "Masala Makhana",
    slug: "masala-makhana",
    path: "makhana/masala-makhana",
    sub: "Spicy & bold",
    emoji: "🌶️",
    imageIndex: 2,
    status: "coming_soon",
  },
  {
    name: "Peri Peri Makhana",
    slug: "peri-peri-makhana",
    path: "makhana/peri-peri-makhana",
    sub: "Zesty & fiery",
    emoji: "🍋",
    imageIndex: 3,
    status: "coming_soon",
  },
  {
    name: "Chocolate Makhana",
    slug: "chocolate-makhana",
    path: "makhana/chocolate-makhana",
    sub: "Sweet indulgence",
    emoji: "🍫",
    imageIndex: 4,
    status: "coming_soon",
  },
  {
    name: "Flavored Mix",
    slug: "flavored-mix",
    path: "makhana/flavored-mix",
    sub: "Assorted favourites",
    emoji: "✨",
    imageIndex: 5,
    status: "coming_soon",
  },
] as const satisfies ReadonlyArray<{
  name: string;
  slug: string;
  path: string;
  sub: string;
  emoji: string;
  imageIndex: number;
  status: MakhanaTypeStatus;
}>;

/** Purchasable categories — plain only for now */
export const SHOP_CATEGORIES = MAKHANA_TYPES.filter((cat) => cat.status === "live");

export const UPCOMING_MAKHANA_TYPES = MAKHANA_TYPES.filter(
  (cat) => cat.status === "coming_soon",
);

export function getMakhanaTypeMeta(slug: string) {
  return MAKHANA_TYPES.find((cat) => cat.slug === slug);
}

export function isActiveMakhanaTypePath(path: string): boolean {
  return SHOP_CATEGORIES.some((cat) => cat.path === path);
}

export function isCatalogMakhanaTypePath(path: string): boolean {
  return MAKHANA_TYPES.some((cat) => cat.path === path);
}

export function categoryUrl(path: string) {
  return `/${path}`;
}

export function shopUrl(params?: { flavours?: string; sort?: string }) {
  if (!params?.flavours && !params?.sort) return SHOP_URL;
  const search = new URLSearchParams();
  if (params.flavours) search.set("flavours", params.flavours);
  if (params.sort) search.set("sort", params.sort);
  const qs = search.toString();
  return qs ? `${SHOP_URL}?${qs}` : SHOP_URL;
}

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: SHOP_URL },
  { label: "About Us", href: "/#about" },
  { label: "Benefits", href: "/#benefits" },
  { label: "Recipes", href: "/#recipes" },
  { label: "Contact", href: "/#contact" },
] as const;
