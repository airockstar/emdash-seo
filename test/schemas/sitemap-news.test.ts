import { describe, it, expect } from "vitest";
import { buildNewsSitemapXml } from "../../src/schemas/sitemap-news.js";

describe("buildNewsSitemapXml", () => {
  it("produces valid news sitemap XML", () => {
    const xml = buildNewsSitemapXml([
      {
        loc: "https://example.com/blog/breaking",
        publicationName: "Example News",
        language: "en",
        publicationDate: "2024-01-15",
        title: "Breaking News Story",
      },
    ]);
    expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
    expect(xml).toContain("<loc>https://example.com/blog/breaking</loc>");
    expect(xml).toContain("<news:name>Example News</news:name>");
    expect(xml).toContain("<news:language>en</news:language>");
    expect(xml).toContain("<news:publication_date>2024-01-15</news:publication_date>");
    expect(xml).toContain("<news:title>Breaking News Story</news:title>");
  });

  it("escapes special characters", () => {
    const xml = buildNewsSitemapXml([
      {
        loc: "https://example.com/blog/a&b",
        publicationName: "News & More",
        language: "en",
        publicationDate: "2024-01-15",
        title: 'Title with "quotes"',
      },
    ]);
    expect(xml).toContain("a&amp;b");
    expect(xml).toContain("News &amp; More");
    expect(xml).toContain("Title with &quot;quotes&quot;");
  });

  it("handles multiple entries", () => {
    const xml = buildNewsSitemapXml([
      { loc: "https://example.com/a", publicationName: "P", language: "en", publicationDate: "2024-01-01", title: "A" },
      { loc: "https://example.com/b", publicationName: "P", language: "en", publicationDate: "2024-01-02", title: "B" },
    ]);
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });

  it("handles empty entries", () => {
    const xml = buildNewsSitemapXml([]);
    expect(xml).toContain("<urlset");
    expect(xml).not.toContain("<url>");
  });
});
