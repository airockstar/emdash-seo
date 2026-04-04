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
      sitemapDefaultPriority: 0.5,
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

describe("sitemap-xml route (index)", () => {
  const handler = sitemapRoutes["sitemap-xml"].handler;

  it("returns flat sitemap for single collection", async () => {
    const ctx = createCtx({}, [
      { id: "p1", collection: "posts", slug: "hello" },
      { id: "p2", collection: "posts", slug: "world" },
    ]);
    const result = await handler(ctx as any) as any;

    expect(result.xml).toContain("<urlset");
    expect(result.xml).toContain("hello</loc>");
    expect(result.xml).toContain("world</loc>");
  });

  it("returns sitemap index for multiple collections", async () => {
    const ctx = createCtx();
    const result = await handler(ctx as any) as any;

    expect(result.xml).toContain("<sitemapindex");
    expect(result.xml).toContain("sitemap-collection");
    expect(result.xml).toContain("posts");
    expect(result.xml).toContain("pages");
  });

  it("returns error when sitemap is disabled", async () => {
    const ctx = createCtx({ sitemapEnabled: false });
    const result = await handler(ctx as any) as any;
    expect(result.error).toBe("disabled");
  });

  it("excludes collections from sitemapExclude", async () => {
    const ctx = createCtx({ sitemapExclude: "pages" });
    const result = await handler(ctx as any) as any;

    // Only posts remain — single collection, flat sitemap
    expect(result.xml).toContain("<urlset");
    expect(result.xml).toContain("hello-world");
    expect(result.xml).not.toContain("about");
  });

  it("excludes noindex pages from flat sitemap", async () => {
    const ctx = createCtx({}, [
      { id: "p1", collection: "posts", slug: "indexed" },
      { id: "p2", collection: "posts", slug: "hidden" },
    ], { p2: { contentId: "p2", robots: "noindex" } });
    const result = await handler(ctx as any) as any;

    expect(result.xml).toContain("indexed");
    expect(result.xml).not.toContain("hidden");
  });

  it("handles empty content list", async () => {
    const ctx = createCtx({}, []);
    const result = await handler(ctx as any) as any;
    expect(result.xml).toContain("<urlset");
    expect(result.xml).not.toContain("<url>");
  });

  it("is a public route", () => {
    expect(sitemapRoutes["sitemap-xml"].public).toBe(true);
  });
});

describe("sitemap-collection route", () => {
  const handler = sitemapRoutes["sitemap-collection"].handler;

  it("returns sitemap for a specific collection", async () => {
    const ctx = { ...createCtx(), input: { collection: "posts" } };
    const result = await handler(ctx as any) as any;

    expect(result.xml).toContain("<urlset");
    expect(result.xml).toContain("hello-world");
    expect(result.xml).toContain("second-post");
    expect(result.xml).not.toContain("about");
  });

  it("returns error for excluded collection", async () => {
    const ctx = { ...createCtx({ sitemapExclude: "pages" }), input: { collection: "pages" } };
    const result = await handler(ctx as any) as any;
    expect(result.error).toBe("excluded");
  });

  it("returns empty sitemap for unknown collection", async () => {
    const ctx = { ...createCtx(), input: { collection: "nonexistent" } };
    const result = await handler(ctx as any) as any;
    expect(result.xml).toContain("<urlset");
    expect(result.xml).not.toContain("<url>");
  });

  it("is a public route", () => {
    expect(sitemapRoutes["sitemap-collection"].public).toBe(true);
  });
});
