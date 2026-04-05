/**
 * Build a canonical URL for a content item.
 * Handles optional collection prefix and falls back to id when slug is absent.
 */
export function buildContentUrl(
  siteUrl: string,
  collection?: string,
  slug?: string,
  id?: string,
): string {
  const s = slug || id || "";
  return collection ? `${siteUrl}/${collection}/${s}` : `${siteUrl}/${s}`;
}
