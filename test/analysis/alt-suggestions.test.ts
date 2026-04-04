import { describe, it, expect } from "vitest";
import { suggestAltText } from "../../src/analysis/alt-suggestions.js";

describe("suggestAltText", () => {
  it("suggests alt from filename for images missing alt", () => {
    const images = [
      { src: "https://example.com/images/hero-banner.jpg" },
      { src: "https://example.com/images/team_photo.png" },
    ];
    const result = suggestAltText(images, "About Us");

    expect(result.length).toBe(2);
    expect(result[0].suggestedAlt).toBe("hero banner");
    expect(result[0].confidence).toBe("high");
    expect(result[1].suggestedAlt).toBe("team photo");
    expect(result[1].confidence).toBe("high");
  });

  it("skips images that already have alt text", () => {
    const images = [
      { alt: "Existing alt", src: "https://example.com/img.jpg" },
      { src: "https://example.com/other-image.jpg" },
    ];
    const result = suggestAltText(images, "My Post");

    expect(result.length).toBe(1);
    expect(result[0].imageIndex).toBe(1);
  });

  it("falls back to content title when no src", () => {
    const images = [{ alt: undefined, src: undefined }];
    const result = suggestAltText(images, "Getting Started Guide");

    expect(result.length).toBe(1);
    expect(result[0].suggestedAlt).toBe("Getting Started Guide");
    expect(result[0].confidence).toBe("low");
  });

  it("returns empty array when all images have alt", () => {
    const images = [
      { alt: "Image 1", src: "https://example.com/a.jpg" },
      { alt: "Image 2", src: "https://example.com/b.jpg" },
    ];
    const result = suggestAltText(images, "Title");

    expect(result).toEqual([]);
  });

  it("returns empty array for empty images list", () => {
    const result = suggestAltText([], "Title");
    expect(result).toEqual([]);
  });

  it("includes correct imageIndex", () => {
    const images = [
      { alt: "has alt", src: "https://example.com/a.jpg" },
      { src: "https://example.com/b.jpg" },
      { alt: "also has alt", src: "https://example.com/c.jpg" },
      { src: "https://example.com/d.jpg" },
    ];
    const result = suggestAltText(images, "Fallback");

    expect(result.length).toBe(2);
    expect(result[0].imageIndex).toBe(1);
    expect(result[1].imageIndex).toBe(3);
  });

  it("strips file extension from filename", () => {
    const images = [{ src: "https://example.com/my-photo.webp" }];
    const result = suggestAltText(images, "Title");

    expect(result[0].suggestedAlt).toBe("my photo");
  });

  it("handles src with query params", () => {
    const images = [{ src: "https://example.com/product-shot.jpg?w=800&q=80" }];
    const result = suggestAltText(images, "Title");

    expect(result[0].suggestedAlt).toBe("product shot");
  });

  it("includes src in suggestion", () => {
    const images = [{ src: "https://example.com/test.jpg" }];
    const result = suggestAltText(images, "Title");

    expect(result[0].src).toBe("https://example.com/test.jpg");
  });
});
