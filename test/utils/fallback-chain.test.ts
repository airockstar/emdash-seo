import { describe, it, expect } from "vitest";
import { resolveSeoData } from "../../src/utils/fallback-chain.js";
import { articlePage, noSeoPage } from "../mocks/page-context.js";
import type { SeoOverrides } from "../../src/types.js";

const defaults = {
  siteName: "Test Site",
  titleTemplate: "{title} | {site}",
  titleSeparator: "|",
  defaultOgImage: "https://example.com/default-og.jpg",
  defaultRobots: "index, follow",
};

describe("resolveSeoData", () => {
  it("uses override values when present", () => {
    const overrides: SeoOverrides = {
      contentId: "post-1",
      title: "Override Title",
      description: "Override desc",
      ogImage: "https://example.com/override.jpg",
      robots: "noindex",
      canonical: "https://example.com/override",
    };
    const result = resolveSeoData(overrides, articlePage, defaults);

    expect(result.title).toBe("Override Title");
    expect(result.description).toBe("Override desc");
    expect(result.ogImage).toBe("https://example.com/override.jpg");
    expect(result.robots).toBe("noindex");
    expect(result.canonical).toBe("https://example.com/override");
  });

  it("falls back to page data when no overrides", () => {
    const result = resolveSeoData(null, articlePage, defaults);

    expect(result.title).toBe("My Blog Post");
    expect(result.description).toBe(
      "A great blog post about testing SEO plugins.",
    );
    expect(result.ogImage).toBe("https://example.com/images/post.jpg");
    expect(result.canonical).toBe("https://example.com/blog/my-post");
  });

  it("falls back to global defaults for OG image", () => {
    const result = resolveSeoData(null, noSeoPage, defaults);

    expect(result.ogImage).toBe("https://example.com/default-og.jpg");
  });

  it("falls back to defaultRobots when page has none", () => {
    const result = resolveSeoData(null, noSeoPage, defaults);

    expect(result.robots).toBe("index, follow");
  });

  it("returns undefined description when page has empty string", () => {
    const result = resolveSeoData(null, noSeoPage, defaults);
    // noSeoPage has description: "" which is falsy but still a string
    expect(result.description).toBe("");
  });

  it("formats title using template", () => {
    const result = resolveSeoData(null, articlePage, defaults);

    expect(result.formattedTitle).toBe("My Blog Post | Test Site");
  });

  it("resolves each field independently", () => {
    const overrides: SeoOverrides = {
      contentId: "post-1",
      title: "Custom Title",
      // no description, ogImage, robots, canonical
    };
    const result = resolveSeoData(overrides, articlePage, defaults);

    expect(result.title).toBe("Custom Title");
    expect(result.description).toBe(
      "A great blog post about testing SEO plugins.",
    );
    expect(result.formattedTitle).toBe("Custom Title | Test Site");
  });

  it("uses page.seo fields as intermediate fallback", () => {
    const pageWithSeo = {
      ...articlePage,
      seo: {
        ogTitle: "SEO Title",
        ogDescription: "SEO Description",
        ogImage: "https://example.com/seo-image.jpg",
        robots: "nofollow",
      },
    };
    const result = resolveSeoData(null, pageWithSeo, defaults);

    expect(result.title).toBe("SEO Title");
    expect(result.description).toBe("SEO Description");
    expect(result.ogImage).toBe("https://example.com/seo-image.jpg");
    expect(result.robots).toBe("nofollow");
  });
});
