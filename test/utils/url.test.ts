import { describe, it, expect } from "vitest";
import { buildContentUrl } from "../../src/utils/url.js";

describe("buildContentUrl", () => {
  it("builds URL with collection and slug", () => {
    expect(buildContentUrl("https://example.com", "posts", "my-post")).toBe(
      "https://example.com/posts/my-post",
    );
  });

  it("builds URL without collection", () => {
    expect(buildContentUrl("https://example.com", undefined, "my-page")).toBe(
      "https://example.com/my-page",
    );
  });

  it("falls back to id when slug is undefined", () => {
    expect(buildContentUrl("https://example.com", "posts", undefined, "post-123")).toBe(
      "https://example.com/posts/post-123",
    );
  });

  it("prefers slug over id", () => {
    expect(buildContentUrl("https://example.com", "posts", "my-slug", "post-123")).toBe(
      "https://example.com/posts/my-slug",
    );
  });

  it("handles empty collection string", () => {
    expect(buildContentUrl("https://example.com", "", "my-page")).toBe(
      "https://example.com/my-page",
    );
  });

  it("handles all undefined optionals", () => {
    expect(buildContentUrl("https://example.com")).toBe(
      "https://example.com/",
    );
  });

  it("does not add trailing slash when slug is present", () => {
    const url = buildContentUrl("https://example.com", "blog", "post");
    expect(url).toBe("https://example.com/blog/post");
    expect(url.endsWith("/")).toBe(false);
  });
});
