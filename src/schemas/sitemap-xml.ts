import { escapeXml } from "../utils/xml.js";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    let xml = `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>`;
    if (entry.lastmod) xml += `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`;
    if (entry.changefreq) xml += `\n    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`;
    if (entry.priority !== undefined) {
      const clamped = Math.min(1, Math.max(0, entry.priority));
      xml += `\n    <priority>${clamped.toFixed(1)}</priority>`;
    }
    xml += "\n  </url>";
    return xml;
  });

  const body = urls.join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export function buildSitemapIndexXml(sitemaps: SitemapIndexEntry[]): string {
  const entries = sitemaps.map((entry) => {
    let xml = `  <sitemap>\n    <loc>${escapeXml(entry.loc)}</loc>`;
    if (entry.lastmod) xml += `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`;
    xml += "\n  </sitemap>";
    return xml;
  });

  const body = entries.join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
}
