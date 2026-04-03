import { describe, it, expect } from "vitest";
import { checkReadability } from "../../src/analysis/readability.js";
import { checkKeywordDensity, checkKeywordInFirstParagraph } from "../../src/analysis/keywords.js";
import { checkInternalLinks } from "../../src/analysis/links.js";
import { checkDuplicateTitle, checkDuplicateDescription } from "../../src/analysis/duplicates.js";

describe("checkReadability", () => {
  it("warns for insufficient text", () => {
    expect(checkReadability("Short.").status).toBe("warn");
  });

  it("passes for simple text", () => {
    const simple = "The cat sat on the mat. The dog ran in the park. It was a nice day. The sun was bright and warm.";
    expect(checkReadability(simple).status).toBe("pass");
  });

  it("warns or fails for complex text", () => {
    const complex = "The implementation of sophisticated computational algorithms necessitates comprehensive understanding of multidimensional mathematical frameworks and their corresponding theoretical underpinnings within the broader context of advanced computer science research methodologies.";
    const result = checkReadability(complex);
    expect(["warn", "fail"]).toContain(result.status);
  });

  it("includes score in message", () => {
    const text = "This is a simple sentence. It is easy to read. Everyone can understand this text easily.";
    expect(checkReadability(text).message).toContain("Readability score:");
  });
});

describe("checkKeywordDensity", () => {
  it("warns for no keyword", () => {
    expect(checkKeywordDensity("Some text", undefined).status).toBe("warn");
  });

  it("warns for low density", () => {
    const text = "The quick brown fox jumps over the lazy dog. " +
      "This is a long paragraph about many different topics. " +
      "We discuss animals, nature, and weather patterns at length.";
    expect(checkKeywordDensity(text, "seo").status).toBe("warn");
  });

  it("passes for good density", () => {
    const filler = "The quick brown fox jumps over the lazy dog near the river bank. ";
    const text = "Learn about SEO tips for your website. " + filler.repeat(6) +
      "Good SEO practices help improve rankings and visibility online.";
    expect(checkKeywordDensity(text, "seo").status).toBe("pass");
  });

  it("warns for high density", () => {
    const text = "SEO SEO SEO SEO SEO SEO SEO SEO SEO SEO is good.";
    expect(checkKeywordDensity(text, "seo").status).toBe("warn");
  });
});

describe("checkKeywordInFirstParagraph", () => {
  it("warns for no keyword", () => {
    expect(checkKeywordInFirstParagraph("Text here", undefined).status).toBe("warn");
  });

  it("passes when keyword in first 300 chars", () => {
    expect(checkKeywordInFirstParagraph("Learn SEO tips for your website.", "seo").status).toBe("pass");
  });

  it("fails when keyword only appears later", () => {
    const text = "A".repeat(301) + " seo tips here";
    expect(checkKeywordInFirstParagraph(text, "seo").status).toBe("fail");
  });
});

describe("checkInternalLinks", () => {
  it("fails for no internal links", () => {
    expect(checkInternalLinks([]).status).toBe("fail");
  });

  it("warns for only 1 internal link", () => {
    expect(checkInternalLinks([
      { href: "/about", text: "About", internal: true },
    ]).status).toBe("warn");
  });

  it("passes for 2+ internal links", () => {
    expect(checkInternalLinks([
      { href: "/about", text: "About", internal: true },
      { href: "/blog", text: "Blog", internal: true },
    ]).status).toBe("pass");
  });

  it("ignores external links", () => {
    expect(checkInternalLinks([
      { href: "https://other.com", text: "Other", internal: false },
      { href: "https://ext.com", text: "Ext", internal: false },
    ]).status).toBe("fail");
  });
});

describe("checkDuplicateTitle", () => {
  const allOverrides = [
    { id: "1", data: { contentId: "1", title: "My Title" } },
    { id: "2", data: { contentId: "2", title: "Another Title" } },
    { id: "3", data: { contentId: "3", title: "My Title" } },
  ];

  it("fails when title is duplicated", () => {
    const result = checkDuplicateTitle("My Title", allOverrides, "1");
    expect(result.status).toBe("fail");
    expect(result.message).toContain("1 other item");
  });

  it("passes when title is unique", () => {
    expect(checkDuplicateTitle("Unique Title", allOverrides, "1").status).toBe("pass");
  });

  it("is case-insensitive", () => {
    expect(checkDuplicateTitle("my title", allOverrides, "1").status).toBe("fail");
  });

  it("warns for missing title", () => {
    expect(checkDuplicateTitle(undefined, allOverrides, "1").status).toBe("warn");
  });
});

describe("checkDuplicateDescription", () => {
  const allOverrides = [
    { id: "1", data: { contentId: "1", description: "Same desc" } },
    { id: "2", data: { contentId: "2", description: "Same desc" } },
  ];

  it("fails when description is duplicated", () => {
    expect(checkDuplicateDescription("Same desc", allOverrides, "1").status).toBe("fail");
  });

  it("passes when description is unique", () => {
    expect(checkDuplicateDescription("Unique desc", allOverrides, "1").status).toBe("pass");
  });
});
