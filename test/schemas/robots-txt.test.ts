import { describe, it, expect } from "vitest";
import { buildRobotsTxt } from "../../src/schemas/robots-txt.js";

describe("buildRobotsTxt", () => {
  it("generates default output with sitemap", () => {
    const txt = buildRobotsTxt({
      sitemapUrl: "https://example.com/sitemap.xml",
    });

    expect(txt).toContain("User-agent: *");
    expect(txt).toContain("Allow: /");
    expect(txt).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("includes crawl delay when set", () => {
    const txt = buildRobotsTxt({
      crawlDelay: 10,
      sitemapUrl: "https://example.com/sitemap.xml",
    });

    expect(txt).toContain("Crawl-delay: 10");
  });

  it("omits crawl delay when zero", () => {
    const txt = buildRobotsTxt({
      crawlDelay: 0,
      sitemapUrl: "https://example.com/sitemap.xml",
    });

    expect(txt).not.toContain("Crawl-delay");
  });

  it("appends custom rules", () => {
    const txt = buildRobotsTxt({
      customRules: "Disallow: /admin/\nDisallow: /private/",
      sitemapUrl: "https://example.com/sitemap.xml",
    });

    expect(txt).toContain("Disallow: /admin/");
    expect(txt).toContain("Disallow: /private/");
  });

  it("puts sitemap URL at the end", () => {
    const txt = buildRobotsTxt({
      customRules: "Disallow: /admin/",
      sitemapUrl: "https://example.com/sitemap.xml",
    });

    const lines = txt.trim().split("\n");
    expect(lines[lines.length - 1]).toBe(
      "Sitemap: https://example.com/sitemap.xml",
    );
  });

  it("ends with newline", () => {
    const txt = buildRobotsTxt({
      sitemapUrl: "https://example.com/sitemap.xml",
    });

    expect(txt.endsWith("\n")).toBe(true);
  });
});
