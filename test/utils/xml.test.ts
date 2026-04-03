import { describe, it, expect } from "vitest";
import { escapeXml } from "../../src/utils/xml.js";

describe("escapeXml", () => {
  it("escapes ampersand", () => {
    expect(escapeXml("foo & bar")).toBe("foo &amp; bar");
  });

  it("escapes angle brackets", () => {
    expect(escapeXml("<tag>")).toBe("&lt;tag&gt;");
  });

  it("escapes quotes", () => {
    expect(escapeXml('he said "hi"')).toBe("he said &quot;hi&quot;");
  });

  it("escapes apostrophes", () => {
    expect(escapeXml("it's")).toBe("it&apos;s");
  });

  it("handles multiple special characters", () => {
    expect(escapeXml('<a href="x&y">')).toBe(
      "&lt;a href=&quot;x&amp;y&quot;&gt;",
    );
  });

  it("returns plain strings unchanged", () => {
    expect(escapeXml("hello world")).toBe("hello world");
  });
});
