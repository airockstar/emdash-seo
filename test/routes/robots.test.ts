import { describe, it, expect } from "vitest";
import { robotsRoutes } from "../../src/routes/robots.js";
import { createMockCtx } from "../mocks/ctx.js";

describe("robots.txt route", () => {
  const handler = robotsRoutes["robots.txt"].handler;

  it("returns robots.txt with sitemap URL", async () => {
    const ctx = createMockCtx();
    const response = await handler(ctx as any);
    const txt = await (response as Response).text();

    expect(txt).toContain("User-agent: *");
    expect(txt).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("sets correct content type", async () => {
    const ctx = createMockCtx();
    const response = await handler(ctx as any);

    expect((response as Response).headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });

  it("includes custom rules from settings", async () => {
    const ctx = createMockCtx({
      settings: { robotsTxtCustom: "Disallow: /admin/" },
    });
    const response = await handler(ctx as any);
    const txt = await (response as Response).text();

    expect(txt).toContain("Disallow: /admin/");
  });

  it("includes crawl delay from settings", async () => {
    const ctx = createMockCtx({
      settings: { robotsCrawlDelay: 5 },
    });
    const response = await handler(ctx as any);
    const txt = await (response as Response).text();

    expect(txt).toContain("Crawl-delay: 5");
  });

  it("is a public route", () => {
    expect(robotsRoutes["robots.txt"].public).toBe(true);
  });
});
