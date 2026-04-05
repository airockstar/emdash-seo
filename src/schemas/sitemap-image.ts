import { escapeXml } from "../utils/xml.js";

export interface ImageSitemapEntry {
  loc: string;
  images: Array<{ url: string; title?: string; caption?: string }>;
}

export function buildImageSitemapXml(entries: ImageSitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const images = entry.images.map((img) => {
      let xml = `    <image:image>\n      <image:loc>${escapeXml(img.url)}</image:loc>`;
      if (img.title) {
        xml += `\n      <image:title>${escapeXml(img.title)}</image:title>`;
      }
      if (img.caption) {
        xml += `\n      <image:caption>${escapeXml(img.caption)}</image:caption>`;
      }
      xml += "\n    </image:image>";
      return xml;
    });

    return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
${images.join("\n")}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>`;
}
