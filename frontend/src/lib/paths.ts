export function slugToPath(slug: string[]): string {
  return slug.join("/");
}

export function categorySlugToPath(slug?: string[]): string {
  if (!slug?.length) return "makhana";
  return `makhana/${slug.join("/")}`;
}

export function pathToUrl(path: string): string {
  return `/${path}`;
}
