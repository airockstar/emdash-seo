import { describe, it, expect } from "vitest";
import { sitemapRoutes } from "../../src/routes/sitemap.js";
import { createMockCtx } from "../mocks/ctx.js";

function createCtx(
  settings: Record<string, unknown> = {},
  contentItems = defaultContent(),
  overrides: Record<string, any> = {},
) {
  return createMockCtx({
    settings: {
      sitemapEnabled: true,
      sitemapDefaultChangefreq: "weekly",
      sitemapDefaultPriority: "0.5",
      ...settings,
    },
    contentItems,
    overrides,
  });
}

function defaultContent() {
  return [
    { id: "p1", collection: "posts", slug: "hello-world", updatedAt: "2026-01-15" },
    { id: "p2", collection: "posts", slug: "second-post", updatedAt: "2026-02-01" },
    { id: "pg1", collection: "pages", slug: "about" },
  ];
}

describe("sitemap.xml route", () => {
  const handler = sitemapRoutes["sitemap.xml"].handler;

  it("returns XML with all published content", async () => {
    const ctx = createCtx();
    const response = await handler(ctx as any);

    const xml = await (response as Response).text();
    expect(xml).toContain("<urlset");
    expect(xml).toContain("hello-world</loc>");
    expect(xml).toContain("second-post</loc>");
    expect(xml).toContain("about</loc>");
  });

  it("sets correct content type", async () => {
    const ctx = createCtx();
    const response = await handler(ctx as any);

    expect((response as Response).headers.get("Content-Type")).toBe(
      "application/xml; charset=utf-8",
    );
  });

  it("returns 404 when sitemap is disabled", async () => {
    const ctx = createCtx({ sitemapEnabled: false });
    const response = await handler(ctx as any);

    expect((response as Response).status).toBe(404);
  });

  it("excludes collections from sitemapExclude", async () => {
    const ctx = createCtx({ sitemapExclude: "pages" });
    const response = await handler(ctx as any);
    const xml = await (response as Response).text();

    expect(xml).toContain("hello-world");
    expect(xml).not.toContain("about");
  });

  it("excludes noindex pages", async () => {
    const ctx = createCtx({}, defaultContent(), {
      p1: { contentId: "p1", robots: "noindex, nofollow" },
    });
    const response = await handler(ctx as any);
    const xml = await (response as Response).text();

    expect(xml).not.toContain("hello-world");
    expect(xml).toContain("second-post");
  });

  it("uses default changefreq and priority", async () => {
    const ctx = createCtx({
      sitemapDefaultChangefreq: "daily",
      sitemapDefaultPriority: "0.8",
    });
    const response = await handler(ctx as any);
    const xml = await (response as Response).text();

    expect(xml).toContain("<changefreq>daily</changefreq>");
    expect(xml).toContain("<priority>0.8</priority>");
  });

  it("includes lastmod from content", async () => {
    const ctx = createCtx();
    const response = await handler(ctx as any);
    const xml = await (response as Response).text();

    expect(xml).toContain("<lastmod>2026-01-15</lastmod>");
  });

  it("handles empty content list", async () => {
    const ctx = createCtx({}, []);
    const response = await handler(ctx as any);
    const xml = await (response as Response).text();

    expect(xml).toContain("<urlset");
    expect(xml).not.toContain("<url>");
  });

  it("is a public route", () => {
    expect(sitemapRoutes["sitemap.xml"].public).toBe(true);
  });
});
