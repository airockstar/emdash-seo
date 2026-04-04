import { describe, it, expect } from "vitest";
import { suggestInternalLinks } from "../../src/analysis/link-suggestions.js";

const allContent = [
  { id: "post-1", data: { title: "Getting Started with TypeScript", collection: "posts", slug: "getting-started-typescript" } },
  { id: "post-2", data: { title: "Advanced React Patterns", collection: "posts", slug: "advanced-react-patterns" } },
  { id: "post-3", data: { title: "Testing Best Practices", collection: "posts", slug: "testing-best-practices" } },
  { id: "post-4", data: { title: "A B", collection: "posts", slug: "short" } },
  { id: "post-5", data: { title: undefined, collection: "posts", slug: "no-title" } },
];

const siteUrl = "https://example.com";

describe("suggestInternalLinks", () => {
  it("returns suggestions when title words appear in text", () => {
    const text = "This article covers getting started with TypeScript and advanced patterns.";
    const result = suggestInternalLinks(text, "current-id", allContent, siteUrl);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].targetId).toBe("post-1");
    expect(result[0].relevanceScore).toBeGreaterThan(0);
  });

  it("excludes the current content item", () => {
    const text = "Getting started with TypeScript is important for testing best practices.";
    const result = suggestInternalLinks(text, "post-1", allContent, siteUrl);

    const ids = result.map((s) => s.targetId);
    expect(ids).not.toContain("post-1");
  });

  it("returns at most 5 suggestions", () => {
    const manyContent = Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i}`,
      data: { title: `Word${i} content article`, collection: "blog", slug: `item-${i}` },
    }));
    const text = "This article has content " + manyContent.map((c) => c.data.title).join(" ");
    const result = suggestInternalLinks(text, "other", manyContent, siteUrl);

    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("sorts by relevance score descending", () => {
    const text = "Getting started with TypeScript and advanced React patterns for testing.";
    const result = suggestInternalLinks(text, "current-id", allContent, siteUrl);

    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].relevanceScore).toBeGreaterThanOrEqual(result[i].relevanceScore);
    }
  });

  it("builds correct target URL", () => {
    const text = "Getting started with TypeScript is important.";
    const result = suggestInternalLinks(text, "current-id", allContent, siteUrl);

    const ts = result.find((s) => s.targetId === "post-1");
    expect(ts?.targetUrl).toBe("https://example.com/posts/getting-started-typescript");
  });

  it("returns empty array for empty text", () => {
    const result = suggestInternalLinks("", "current-id", allContent, siteUrl);
    expect(result).toEqual([]);
  });

  it("returns empty array for empty content list", () => {
    const result = suggestInternalLinks("Some text here", "current-id", [], siteUrl);
    expect(result).toEqual([]);
  });

  it("skips items with no title", () => {
    const text = "no-title some words here";
    const result = suggestInternalLinks(text, "current-id", allContent, siteUrl);

    const ids = result.map((s) => s.targetId);
    expect(ids).not.toContain("post-5");
  });

  it("filters out items with only short/stop words in title", () => {
    // post-4 has title "A B" — too short for word matching, and "A B" as a phrase
    // won't match meaningful text that doesn't contain exactly "a b"
    const text = "This text discusses completely unrelated topics without mentioning any short titles.";
    const result = suggestInternalLinks(text, "current-id", allContent, siteUrl);

    const ids = result.map((s) => s.targetId);
    expect(ids).not.toContain("post-4");
  });

  it("includes matchedPhrase in the suggestion", () => {
    const text = "This is about testing and best practices in software.";
    const result = suggestInternalLinks(text, "current-id", allContent, siteUrl);

    const match = result.find((s) => s.targetId === "post-3");
    expect(match).toBeDefined();
    expect(match!.matchedPhrase).toContain("testing");
  });
});
