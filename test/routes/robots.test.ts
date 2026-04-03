import { describe, it, expect } from "vitest";
import { robotsRoutes } from "../../src/routes/robots.js";
import { createMockCtx } from "../mocks/ctx.js";

describe("robots-txt route", () => {
  const handler = robotsRoutes["robots-txt"].handler;

  it("returns robots.txt with sitemap URL", async () => {
    const ctx = createMockCtx();
    const result = await handler(ctx as any) as any;

    expect(result.text).toContain("User-agent: *");
    expect(result.text).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("returns text/plain content type", async () => {
    const ctx = createMockCtx();
    const result = await handler(ctx as any) as any;
    expect(result.contentType).toBe("text/plain");
  });

  it("includes custom rules from settings", async () => {
    const ctx = createMockCtx({
      settings: { robotsTxtCustom: "Disallow: /admin/" },
    });
    const result = await handler(ctx as any) as any;
    expect(result.text).toContain("Disallow: /admin/");
  });

  it("includes crawl delay from settings", async () => {
    const ctx = createMockCtx({
      settings: { robotsCrawlDelay: 5 },
    });
    const result = await handler(ctx as any) as any;
    expect(result.text).toContain("Crawl-delay: 5");
  });

  it("is a public route", () => {
    expect(robotsRoutes["robots-txt"].public).toBe(true);
  });
});
