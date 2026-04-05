import { escapeXml } from "../utils/xml.js";

export interface VideoSitemapEntry {
  loc: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  contentUrl?: string;
  duration?: number;
}

export function buildVideoSitemapXml(entries: VideoSitemapEntry[]): string {
  const urls = entries.map((entry) => {
    let video = `      <video:thumbnail_loc>${escapeXml(entry.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(entry.title)}</video:title>
      <video:description>${escapeXml(entry.description)}</video:description>`;
    if (entry.contentUrl) {
      video += `\n      <video:content_loc>${escapeXml(entry.contentUrl)}</video:content_loc>`;
    }
    if (entry.duration !== undefined) {
      video += `\n      <video:duration>${entry.duration}</video:duration>`;
    }

    return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <video:video>
${video}
    </video:video>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join("\n")}
</urlset>`;
}
