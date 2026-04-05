import { describe, it, expect } from "vitest";
import { metadataHandler } from "../../src/hooks/metadata.js";
import { createMockCtx } from "../mocks/ctx.js";
import {
  articlePage,
  genericPage,
  homePage,
  noSeoPage,
} from "../mocks/page-context.js";

function createCtx(settings: Record<string, unknown> = {}) {
  return createMockCtx({
    settings: {
      siteName: "Test Site",
      titleTemplate: "{title} | {site}",
      titleSeparator: "|",
      defaultOgImage: "https://example.com/default-og.jpg",
      twitterHandle: "@testsite",
      orgName: "Test Corp",
      orgLogoUrl: "https://example.com/logo.png",
      defaultRobots: "index, follow",
      ...settings,
    },
  });
}

function findMeta(contributions: any[], name: string) {
  return contributions.find((c) => c.kind === "meta" && c.name === name);
}

function findProperty(contributions: any[], prop: string) {
  return contributions.find(
    (c) => c.kind === "property" && c.property === prop,
  );
}

function findJsonld(contributions: any[], type: string) {
  return contributions.find(
    (c) => c.kind === "jsonld" && c.graph?.["@type"] === type,
  );
}

describe("metadataHandler", () => {
  it("produces meta description for article page", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const desc = findMeta(result, "description");

    expect(desc).toBeDefined();
    expect(desc.content).toBe(articlePage.description);
  });

  it("produces robots meta tag", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const robots = findMeta(result, "robots");

    expect(robots).toBeDefined();
    expect(robots.content).toBe("index, follow");
  });

  it("produces canonical link", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const canonical = result.find(
      (c) => c.kind === "link" && c.rel === "canonical",
    );

    expect(canonical).toBeDefined();
    expect(canonical!.href).toBe(articlePage.canonical);
  });

  it("produces OG title with template", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const ogTitle = findProperty(result, "og:title");

    expect(ogTitle).toBeDefined();
    expect(ogTitle.content).toBe("My Blog Post | Test Site");
  });

  it("produces OG description", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const ogDesc = findProperty(result, "og:description");

    expect(ogDesc).toBeDefined();
    expect(ogDesc.content).toBe(articlePage.description);
  });

  it("produces OG image from page", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const ogImage = findProperty(result, "og:image");

    expect(ogImage).toBeDefined();
    expect(ogImage.content).toBe(articlePage.image);
  });

  it("falls back to default OG image", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: noSeoPage }, ctx);
    const ogImage = findProperty(result, "og:image");

    expect(ogImage).toBeDefined();
    expect(ogImage.content).toBe("https://example.com/default-og.jpg");
  });

  it("sets og:type to article for content pages", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const ogType = findProperty(result, "og:type");

    expect(ogType.content).toBe("article");
  });

  it("sets og:type to website for custom pages", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: genericPage }, ctx);
    const ogType = findProperty(result, "og:type");

    expect(ogType.content).toBe("website");
  });

  it("produces og:site_name", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const ogSiteName = findProperty(result, "og:site_name");

    expect(ogSiteName).toBeDefined();
    expect(ogSiteName.content).toBe("Test Site");
  });

  it("produces og:locale", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const ogLocale = findProperty(result, "og:locale");

    expect(ogLocale).toBeDefined();
    expect(ogLocale.content).toBe("en");
  });

  it("produces article OG tags for content pages", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);

    expect(findProperty(result, "article:published_time")).toBeDefined();
    expect(findProperty(result, "article:modified_time")).toBeDefined();
    expect(findProperty(result, "article:author")).toBeDefined();
  });

  it("sets twitter:card to summary_large_image when image present", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const card = findMeta(result, "twitter:card");

    expect(card.content).toBe("summary_large_image");
  });

  it("sets twitter:card to summary when no image", async () => {
    const ctx = createCtx({ defaultOgImage: "" });
    const result = await metadataHandler({ page: noSeoPage }, ctx);
    const card = findMeta(result, "twitter:card");

    expect(card.content).toBe("summary");
  });

  it("produces twitter:site and twitter:creator from settings", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);

    expect(findMeta(result, "twitter:site")?.content).toBe("@testsite");
    expect(findMeta(result, "twitter:creator")?.content).toBe("@testsite");
  });

  it("adds @ prefix to twitter handle if missing", async () => {
    const ctx = createCtx({ twitterHandle: "testsite" });
    const result = await metadataHandler({ page: articlePage }, ctx);

    expect(findMeta(result, "twitter:site")?.content).toBe("@testsite");
  });

  it("produces Article JSON-LD for content pages", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const article = findJsonld(result, "Article");

    expect(article).toBeDefined();
    expect(article.graph.headline).toBe("My Blog Post");
  });

  it("enriches author JSON-LD with user data when ctx.users available", async () => {
    const ctx = createCtx();
    const authorPage = { ...articlePage, articleMeta: { ...articlePage.articleMeta!, author: "author-1" } };
    const result = await metadataHandler({ page: authorPage }, ctx);
    const article = findJsonld(result, "Article");

    expect(article.graph.author).toEqual({
      "@type": "Person",
      name: "Jane Doe",
      image: "https://example.com/jane.jpg",
    });
  });

  it("falls back to string author when user not found", async () => {
    const ctx = createCtx();
    const authorPage = { ...articlePage, articleMeta: { ...articlePage.articleMeta!, author: "unknown-author" } };
    const result = await metadataHandler({ page: authorPage }, ctx);
    const article = findJsonld(result, "Article");

    expect(article.graph.author).toEqual({ "@type": "Person", name: "unknown-author" });
  });

  it("produces WebPage JSON-LD for generic pages", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: genericPage }, ctx);
    const webPage = findJsonld(result, "WebPage");

    expect(webPage).toBeDefined();
  });

  it("always produces BreadcrumbList JSON-LD", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const breadcrumb = findJsonld(result, "BreadcrumbList");

    expect(breadcrumb).toBeDefined();
  });

  it("produces Organization JSON-LD when orgName configured", async () => {
    const ctx = createCtx();
    const result = await metadataHandler({ page: articlePage }, ctx);
    const org = findJsonld(result, "Organization");

    expect(org).toBeDefined();
    expect(org.graph.name).toBe("Test Corp");
  });

  it("omits Organization JSON-LD when orgName empty", async () => {
    const ctx = createCtx({ orgName: "" });
    const result = await metadataHandler({ page: articlePage }, ctx);
    const org = findJsonld(result, "Organization");

    expect(org).toBeUndefined();
  });

  it("produces WebSite JSON-LD only on homepage", async () => {
    const ctx = createCtx();
    const homeResult = await metadataHandler({ page: homePage }, ctx);
    const articleResult = await metadataHandler({ page: articlePage }, ctx);

    expect(findJsonld(homeResult, "WebSite")).toBeDefined();
    expect(findJsonld(articleResult, "WebSite")).toBeUndefined();
  });

  it("uses override values when present", async () => {
    const ctx = createCtx();
    ctx.storage.overrides._store.set("post-1", {
      contentId: "post-1",
      title: "Override Title",
      description: "Override description",
    } as any);

    const result = await metadataHandler({ page: articlePage }, ctx);
    const desc = findMeta(result, "description");

    expect(desc.content).toBe("Override description");
    expect(findProperty(result, "og:title")?.content).toContain(
      "Override Title",
    );
  });

  it("uses custom breadcrumb label from overrides", async () => {
    const ctx = createCtx();
    ctx.storage.overrides._store.set("post-1", {
      contentId: "post-1",
      breadcrumbLabel: "Custom Crumb",
    } as any);

    const result = await metadataHandler({ page: articlePage }, ctx);
    const breadcrumb = findJsonld(result, "BreadcrumbList");
    const items = breadcrumb.graph.itemListElement as Array<Record<string, unknown>>;
    const lastItem = items[items.length - 1];

    expect(lastItem.name).toBe("Custom Crumb");
  });

  it("skips description meta when no description", async () => {
    const ctx = createCtx({ defaultOgImage: "" });
    const result = await metadataHandler({ page: noSeoPage }, ctx);
    const desc = findMeta(result, "description");

    expect(desc).toBeUndefined();
  });

  it("produces hreflang tags when enabled with valid mappings", async () => {
    const mappings = JSON.stringify([
      { lang: "en", urlPrefix: "https://en.example.com" },
      { lang: "fr", urlPrefix: "https://fr.example.com" },
    ]);
    const ctx = createCtx({ hreflangEnabled: true, hreflangMappings: mappings });
    const result = await metadataHandler({ page: articlePage }, ctx);

    const hreflangLinks = result.filter(
      (c) => c.kind === "link" && c.rel === "alternate" && c.hreflang,
    );

    expect(hreflangLinks.length).toBe(3); // en, fr, x-default
    expect(hreflangLinks.find((l) => l.hreflang === "en")?.href).toBe(
      "https://en.example.com/blog/my-post",
    );
    expect(hreflangLinks.find((l) => l.hreflang === "fr")?.href).toBe(
      "https://fr.example.com/blog/my-post",
    );
    expect(hreflangLinks.find((l) => l.hreflang === "x-default")?.href).toBe(
      "https://example.com/blog/my-post",
    );
  });

  it("skips hreflang tags when disabled", async () => {
    const mappings = JSON.stringify([
      { lang: "en", urlPrefix: "https://en.example.com" },
    ]);
    const ctx = createCtx({ hreflangEnabled: false, hreflangMappings: mappings });
    const result = await metadataHandler({ page: articlePage }, ctx);

    const hreflangLinks = result.filter(
      (c) => c.kind === "link" && c.rel === "alternate" && c.hreflang,
    );
    expect(hreflangLinks.length).toBe(0);
  });

  it("skips hreflang tags when mappings is invalid JSON", async () => {
    const ctx = createCtx({ hreflangEnabled: true, hreflangMappings: "not-json" });
    const result = await metadataHandler({ page: articlePage }, ctx);

    const hreflangLinks = result.filter(
      (c) => c.kind === "link" && c.rel === "alternate" && c.hreflang,
    );
    expect(hreflangLinks.length).toBe(0);
  });

  it("skips hreflang tags when mappings is empty", async () => {
    const ctx = createCtx({ hreflangEnabled: true, hreflangMappings: "" });
    const result = await metadataHandler({ page: articlePage }, ctx);

    const hreflangLinks = result.filter(
      (c) => c.kind === "link" && c.rel === "alternate" && c.hreflang,
    );
    expect(hreflangLinks.length).toBe(0);
  });
});
