import { describe, it, expect } from "vitest";
import {
  buildSitemapXml,
  buildSitemapIndexXml,
} from "../../src/schemas/sitemap-xml.js";

describe("buildSitemapXml", () => {
  it("generates valid XML with all fields", () => {
    const xml = buildSitemapXml([
      {
        loc: "https://example.com/page",
        lastmod: "2026-01-15",
        changefreq: "weekly",
        priority: 0.8,
      },
    ]);

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<loc>https://example.com/page</loc>");
    expect(xml).toContain("<lastmod>2026-01-15</lastmod>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>0.8</priority>");
    expect(xml).toContain("</urlset>");
  });

  it("omits optional fields when not provided", () => {
    const xml = buildSitemapXml([{ loc: "https://example.com/" }]);

    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).not.toContain("<lastmod>");
    expect(xml).not.toContain("<changefreq>");
    expect(xml).not.toContain("<priority>");
  });

  it("handles empty entries", () => {
    const xml = buildSitemapXml([]);

    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
    expect(xml).not.toContain("<url>");
  });

  it("escapes special characters in URLs", () => {
    const xml = buildSitemapXml([
      { loc: "https://example.com/page?a=1&b=2" },
    ]);

    expect(xml).toContain("a=1&amp;b=2");
  });

  it("formats priority with one decimal", () => {
    const xml = buildSitemapXml([
      { loc: "https://example.com/", priority: 1 },
    ]);

    expect(xml).toContain("<priority>1.0</priority>");
  });

  it("handles multiple entries", () => {
    const xml = buildSitemapXml([
      { loc: "https://example.com/a" },
      { loc: "https://example.com/b" },
      { loc: "https://example.com/c" },
    ]);

    expect(xml.match(/<url>/g)).toHaveLength(3);
  });
});

describe("buildSitemapIndexXml", () => {
  it("generates valid sitemap index", () => {
    const xml = buildSitemapIndexXml([
      { loc: "https://example.com/sitemap-posts.xml", lastmod: "2026-01-15" },
      { loc: "https://example.com/sitemap-pages.xml" },
    ]);

    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("<sitemap>");
    expect(xml).toContain("sitemap-posts.xml</loc>");
    expect(xml).toContain("<lastmod>2026-01-15</lastmod>");
    expect(xml).toContain("</sitemapindex>");
  });

  it("handles empty sitemaps list", () => {
    const xml = buildSitemapIndexXml([]);

    expect(xml).toContain("<sitemapindex");
    expect(xml).not.toContain("<sitemap>");
  });
});
