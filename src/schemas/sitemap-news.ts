import { escapeXml } from "../utils/xml.js";

export interface NewsSitemapEntry {
  loc: string;
  publicationName: string;
  language: string;
  publicationDate: string;
  title: string;
}

export function buildNewsSitemapXml(entries: NewsSitemapEntry[]): string {
  const urls = entries.map((entry) => {
    return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(entry.publicationName)}</news:name>
        <news:language>${escapeXml(entry.language)}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(entry.publicationDate)}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>
    </news:news>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join("\n")}
</urlset>`;
}
