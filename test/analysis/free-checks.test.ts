import { describe, it, expect } from "vitest";
import { checkTitleLength, checkTitleKeyword } from "../../src/analysis/title.js";
import { checkDescriptionLength, checkDescriptionKeyword } from "../../src/analysis/description.js";
import { checkSingleH1, checkHeadingHierarchy } from "../../src/analysis/headings.js";
import { checkImageAltText } from "../../src/analysis/images.js";

describe("checkTitleLength", () => {
  it("fails for missing title", () => {
    expect(checkTitleLength(undefined).status).toBe("fail");
  });

  it("warns for short title", () => {
    expect(checkTitleLength("Short").status).toBe("warn");
  });

  it("warns for long title", () => {
    expect(checkTitleLength("A".repeat(65)).status).toBe("warn");
  });

  it("passes for optimal length", () => {
    expect(checkTitleLength("A good title that is about forty chars long").status).toBe("pass");
  });
});

describe("checkTitleKeyword", () => {
  it("warns when no keyword set", () => {
    expect(checkTitleKeyword("My Title", undefined).status).toBe("warn");
  });

  it("fails when keyword not in title", () => {
    expect(checkTitleKeyword("My Title", "missing").status).toBe("fail");
  });

  it("passes when keyword found in title", () => {
    expect(checkTitleKeyword("SEO Plugin Guide", "seo plugin").status).toBe("pass");
  });

  it("is case-insensitive", () => {
    expect(checkTitleKeyword("SEO Plugin", "seo plugin").status).toBe("pass");
  });
});

describe("checkDescriptionLength", () => {
  it("fails for missing description", () => {
    expect(checkDescriptionLength(undefined).status).toBe("fail");
  });

  it("warns for short description", () => {
    expect(checkDescriptionLength("Too short").status).toBe("warn");
  });

  it("warns for long description", () => {
    expect(checkDescriptionLength("A".repeat(165)).status).toBe("warn");
  });

  it("passes for optimal length", () => {
    const good = "A".repeat(140);
    expect(checkDescriptionLength(good).status).toBe("pass");
  });
});

describe("checkDescriptionKeyword", () => {
  it("warns when no keyword set", () => {
    expect(checkDescriptionKeyword("Some description", undefined).status).toBe("warn");
  });

  it("fails when keyword not found", () => {
    expect(checkDescriptionKeyword("Some description", "missing").status).toBe("fail");
  });

  it("passes when keyword found", () => {
    expect(checkDescriptionKeyword("Learn about SEO basics", "seo").status).toBe("pass");
  });
});

describe("checkSingleH1", () => {
  it("fails for no H1", () => {
    expect(checkSingleH1([{ level: 2, text: "Sub" }]).status).toBe("fail");
  });

  it("fails for multiple H1s", () => {
    expect(checkSingleH1([
      { level: 1, text: "First" },
      { level: 1, text: "Second" },
    ]).status).toBe("fail");
  });

  it("passes for single H1", () => {
    expect(checkSingleH1([
      { level: 1, text: "Title" },
      { level: 2, text: "Sub" },
    ]).status).toBe("pass");
  });
});

describe("checkHeadingHierarchy", () => {
  it("warns for no headings", () => {
    expect(checkHeadingHierarchy([]).status).toBe("warn");
  });

  it("warns for skipped levels", () => {
    const result = checkHeadingHierarchy([
      { level: 1, text: "Title" },
      { level: 3, text: "Skip H2" },
    ]);
    expect(result.status).toBe("warn");
    expect(result.message).toContain("H1 to H3");
  });

  it("passes for correct hierarchy", () => {
    expect(checkHeadingHierarchy([
      { level: 1, text: "Title" },
      { level: 2, text: "Section" },
      { level: 3, text: "Subsection" },
    ]).status).toBe("pass");
  });

  it("allows going up levels", () => {
    expect(checkHeadingHierarchy([
      { level: 1, text: "Title" },
      { level: 2, text: "Section" },
      { level: 2, text: "Another Section" },
    ]).status).toBe("pass");
  });
});

describe("checkImageAltText", () => {
  it("passes for no images", () => {
    expect(checkImageAltText([]).status).toBe("pass");
  });

  it("passes when all images have alt", () => {
    expect(checkImageAltText([
      { alt: "Photo 1", src: "a.jpg" },
      { alt: "Photo 2", src: "b.jpg" },
    ]).status).toBe("pass");
  });

  it("fails when some images lack alt", () => {
    const result = checkImageAltText([
      { alt: "Photo 1", src: "a.jpg" },
      { src: "b.jpg" },
      { src: "c.jpg" },
    ]);
    expect(result.status).toBe("fail");
    expect(result.message).toContain("2 of 3");
  });

  it("fails when all images lack alt", () => {
    const result = checkImageAltText([{ src: "a.jpg" }]);
    expect(result.status).toBe("fail");
  });
});
