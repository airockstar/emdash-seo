import { describe, it, expect } from "vitest";
import {
  buildArticleSchema,
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "../../src/schemas/jsonld.js";

describe("buildArticleSchema", () => {
  it("returns Article with all fields", () => {
    const result = buildArticleSchema({
      headline: "My Post",
      description: "A great post",
      image: "https://example.com/img.jpg",
      datePublished: "2026-01-15T10:00:00Z",
      dateModified: "2026-02-01T14:30:00Z",
      author: "Jane Doe",
      publisherName: "Example Corp",
      publisherLogo: "https://example.com/logo.png",
      url: "https://example.com/blog/my-post",
    });

    expect(result["@type"]).toBe("Article");
    expect(result.headline).toBe("My Post");
    expect(result.author).toEqual({ "@type": "Person", name: "Jane Doe" });
    expect(result.publisher).toEqual({
      "@type": "Organization",
      name: "Example Corp",
      logo: { "@type": "ImageObject", url: "https://example.com/logo.png" },
    });
  });

  it("omits undefined fields", () => {
    const result = buildArticleSchema({ headline: "Title" });

    expect(result["@type"]).toBe("Article");
    expect(result.headline).toBe("Title");
    expect(result).not.toHaveProperty("description");
    expect(result).not.toHaveProperty("author");
    expect(result).not.toHaveProperty("publisher");
  });
});

describe("buildWebPageSchema", () => {
  it("returns WebPage schema", () => {
    const result = buildWebPageSchema({
      name: "About Us",
      description: "Learn about us",
      url: "https://example.com/about",
    });

    expect(result["@type"]).toBe("WebPage");
    expect(result.name).toBe("About Us");
    expect(result.url).toBe("https://example.com/about");
  });

  it("omits empty description", () => {
    const result = buildWebPageSchema({
      name: "Page",
      url: "https://example.com/page",
    });

    expect(result).not.toHaveProperty("description");
  });
});

describe("buildBreadcrumbSchema", () => {
  it("builds breadcrumb from URL path", () => {
    const result = buildBreadcrumbSchema(
      "https://example.com/blog/my-post",
      "Example",
    );
    const items = result.itemListElement as Array<Record<string, unknown>>;

    expect(result["@type"]).toBe("BreadcrumbList");
    expect(items).toHaveLength(3);
    expect(items[0].name).toBe("Example");
    expect(items[0].item).toBe("https://example.com/");
    expect(items[0].position).toBe(1);
    expect(items[1].name).toBe("Blog");
    expect(items[1].item).toBe("https://example.com/blog");
    expect(items[1].position).toBe(2);
    expect(items[2].name).toBe("My post");
    expect(items[2].position).toBe(3);
  });

  it("returns single item for root path", () => {
    const result = buildBreadcrumbSchema("https://example.com/", "Home");
    const items = result.itemListElement as Array<Record<string, unknown>>;

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Home");
  });
});

describe("buildOrganizationSchema", () => {
  it("returns Organization with logo", () => {
    const result = buildOrganizationSchema({
      name: "Example Corp",
      url: "https://example.com",
      logo: "https://example.com/logo.png",
    });

    expect(result["@type"]).toBe("Organization");
    expect(result.logo).toEqual({
      "@type": "ImageObject",
      url: "https://example.com/logo.png",
    });
  });

  it("omits logo when not provided", () => {
    const result = buildOrganizationSchema({
      name: "Example Corp",
      url: "https://example.com",
    });

    expect(result).not.toHaveProperty("logo");
  });
});

describe("buildWebSiteSchema", () => {
  it("returns WebSite with SearchAction", () => {
    const result = buildWebSiteSchema({
      name: "Example",
      url: "https://example.com",
    });

    expect(result["@type"]).toBe("WebSite");
    expect(result.name).toBe("Example");
    const action = result.potentialAction as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
    expect(action.target).toBe("https://example.com?s={search_term_string}");
  });
});
