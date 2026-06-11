/** Display pack size consistently on product cards (e.g. "100g") */
export function formatPackSize(packSize: string): string {
  return packSize.replace(/\s+/g, "").toLowerCase();
}
