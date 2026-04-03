import { describe, it, expect } from "vitest";
import { formatSocialPost } from "../../../src/utils/social/format.js";

describe("formatSocialPost", () => {
  it("replaces placeholders", () => {
    expect(formatSocialPost("New: {title} - {url}", {
      title: "My Post",
      url: "https://example.com/post",
    })).toBe("New: My Post - https://example.com/post");
  });

  it("handles missing values", () => {
    expect(formatSocialPost("{title} - {description}", { title: "Post" })).toBe("Post -");
  });

  it("trims result", () => {
    expect(formatSocialPost("  {title}  ", { title: "Post" })).toBe("Post");
  });
});
