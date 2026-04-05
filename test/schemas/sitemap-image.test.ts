import { describe, it, expect } from "vitest";
import { buildImageSitemapXml } from "../../src/schemas/sitemap-image.js";

describe("buildImageSitemapXml", () => {
  it("produces valid image sitemap XML", () => {
    const xml = buildImageSitemapXml([
      {
        loc: "https://example.com/blog/post-1",
        images: [
          { url: "https://example.com/img1.jpg", title: "Image 1", caption: "A photo" },
        ],
      },
    ]);
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    expect(xml).toContain("<loc>https://example.com/blog/post-1</loc>");
    expect(xml).toContain("<image:loc>https://example.com/img1.jpg</image:loc>");
    expect(xml).toContain("<image:title>Image 1</image:title>");
    expect(xml).toContain("<image:caption>A photo</image:caption>");
  });

  it("handles multiple images per URL", () => {
    const xml = buildImageSitemapXml([
      {
        loc: "https://example.com/page",
        images: [
          { url: "https://example.com/a.jpg" },
          { url: "https://example.com/b.jpg", title: "B" },
        ],
      },
    ]);
    expect(xml.match(/<image:image>/g)).toHaveLength(2);
  });

  it("omits optional fields when not provided", () => {
    const xml = buildImageSitemapXml([
      {
        loc: "https://example.com/page",
        images: [{ url: "https://example.com/img.jpg" }],
      },
    ]);
    expect(xml).not.toContain("<image:title>");
    expect(xml).not.toContain("<image:caption>");
  });

  it("escapes special characters", () => {
    const xml = buildImageSitemapXml([
      {
        loc: "https://example.com/p",
        images: [{ url: "https://example.com/a&b.jpg", title: "A & B" }],
      },
    ]);
    expect(xml).toContain("a&amp;b.jpg");
    expect(xml).toContain("A &amp; B");
  });

  it("handles empty entries", () => {
    const xml = buildImageSitemapXml([]);
    expect(xml).toContain("<urlset");
    expect(xml).not.toContain("<url>");
  });
});
