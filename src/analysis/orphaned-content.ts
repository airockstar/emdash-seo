import { buildContentUrl } from "../utils/url.js";

export interface OrphanedItem {
  id: string;
  title?: string;
  collection?: string;
  url: string;
}

/**
 * Find content items that are not linked to from any other content.
 * An "orphaned" page has no internal links pointing to it.
 */
export function findOrphanedContent(
  allContent: Array<{ id: string; data: Record<string, unknown> }>,
  allLinks: Array<{ href: string; internal: boolean }>,
  siteUrl: string,
): OrphanedItem[] {
  // Build a set of all internal link target URLs (normalized, no trailing slash)
  const linkedUrls = new Set<string>();
  for (const link of allLinks) {
    if (!link.internal) continue;
    const normalized = link.href.startsWith("/")
      ? `${siteUrl}${link.href}`.replace(/\/+$/, "")
      : link.href.replace(/\/+$/, "");
    linkedUrls.add(normalized);
  }

  const orphaned: OrphanedItem[] = [];
  for (const item of allContent) {
    const slug = (item.data.slug as string) || item.id;
    const collection = item.data.collection as string | undefined;
    const url = buildContentUrl(siteUrl, collection, slug);

    if (!linkedUrls.has(url.replace(/\/+$/, ""))) {
      orphaned.push({
        id: item.id,
        title: item.data.title as string | undefined,
        collection,
        url,
      });
    }
  }

  return orphaned;
}
