import { describe, it, expect } from "vitest";
import { findOrphanedContent } from "../../src/analysis/orphaned-content.js";

const SITE_URL = "https://example.com";

describe("findOrphanedContent", () => {
  it("returns all content when no links exist", () => {
    const content = [
      { id: "post-1", data: { slug: "hello", collection: "blog", title: "Hello" } },
      { id: "post-2", data: { slug: "world", collection: "blog", title: "World" } },
    ];
    const result = findOrphanedContent(content, [], SITE_URL);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("post-1");
    expect(result[0].url).toBe("https://example.com/blog/hello");
    expect(result[1].id).toBe("post-2");
  });

  it("excludes content that is linked to", () => {
    const content = [
      { id: "post-1", data: { slug: "hello", collection: "blog", title: "Hello" } },
      { id: "post-2", data: { slug: "world", collection: "blog", title: "World" } },
    ];
    const links = [
      { href: "https://example.com/blog/hello", internal: true },
    ];
    const result = findOrphanedContent(content, links, SITE_URL);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("post-2");
  });

  it("handles relative links (starts with /)", () => {
    const content = [
      { id: "p-1", data: { slug: "about", collection: "pages", title: "About" } },
    ];
    const links = [
      { href: "/pages/about", internal: true },
    ];
    const result = findOrphanedContent(content, links, SITE_URL);
    expect(result).toHaveLength(0);
  });

  it("ignores external links", () => {
    const content = [
      { id: "p-1", data: { slug: "about", collection: "pages", title: "About" } },
    ];
    const links = [
      { href: "https://other.com/pages/about", internal: false },
    ];
    const result = findOrphanedContent(content, links, SITE_URL);
    expect(result).toHaveLength(1);
  });

  it("returns empty array when all content is linked", () => {
    const content = [
      { id: "post-1", data: { slug: "hello", collection: "blog" } },
    ];
    const links = [
      { href: "https://example.com/blog/hello", internal: true },
    ];
    const result = findOrphanedContent(content, links, SITE_URL);
    expect(result).toHaveLength(0);
  });

  it("uses item id as slug fallback", () => {
    const content = [
      { id: "post-1", data: { collection: "blog", title: "No Slug" } },
    ];
    const result = findOrphanedContent(content, [], SITE_URL);
    expect(result[0].url).toBe("https://example.com/blog/post-1");
  });

  it("handles content without collection", () => {
    const content = [
      { id: "page-1", data: { slug: "standalone", title: "Standalone" } },
    ];
    const result = findOrphanedContent(content, [], SITE_URL);
    expect(result[0].url).toBe("https://example.com/standalone");
  });

  it("normalizes trailing slashes when matching", () => {
    const content = [
      { id: "p-1", data: { slug: "about", collection: "pages" } },
    ];
    const links = [
      { href: "https://example.com/pages/about/", internal: true },
    ];
    const result = findOrphanedContent(content, links, SITE_URL);
    expect(result).toHaveLength(0);
  });
});
