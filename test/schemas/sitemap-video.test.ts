import { describe, it, expect } from "vitest";
import { buildVideoSitemapXml } from "../../src/schemas/sitemap-video.js";

describe("buildVideoSitemapXml", () => {
  it("produces valid video sitemap XML", () => {
    const xml = buildVideoSitemapXml([
      {
        loc: "https://example.com/videos/tutorial",
        thumbnailUrl: "https://example.com/thumb.jpg",
        title: "Tutorial Video",
        description: "A helpful tutorial",
        contentUrl: "https://example.com/video.mp4",
        duration: 300,
      },
    ]);
    expect(xml).toContain('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
    expect(xml).toContain("<loc>https://example.com/videos/tutorial</loc>");
    expect(xml).toContain("<video:thumbnail_loc>https://example.com/thumb.jpg</video:thumbnail_loc>");
    expect(xml).toContain("<video:title>Tutorial Video</video:title>");
    expect(xml).toContain("<video:description>A helpful tutorial</video:description>");
    expect(xml).toContain("<video:content_loc>https://example.com/video.mp4</video:content_loc>");
    expect(xml).toContain("<video:duration>300</video:duration>");
  });

  it("omits optional fields when not provided", () => {
    const xml = buildVideoSitemapXml([
      {
        loc: "https://example.com/page",
        thumbnailUrl: "https://example.com/thumb.jpg",
        title: "Title",
        description: "Desc",
      },
    ]);
    expect(xml).not.toContain("content_loc");
    expect(xml).not.toContain("duration");
  });

  it("escapes special characters", () => {
    const xml = buildVideoSitemapXml([
      {
        loc: "https://example.com/v",
        thumbnailUrl: "https://example.com/t.jpg",
        title: "A & B",
        description: 'Say "hello"',
      },
    ]);
    expect(xml).toContain("A &amp; B");
    expect(xml).toContain("Say &quot;hello&quot;");
  });

  it("handles empty entries", () => {
    const xml = buildVideoSitemapXml([]);
    expect(xml).toContain("<urlset");
    expect(xml).not.toContain("<url>");
  });
});
