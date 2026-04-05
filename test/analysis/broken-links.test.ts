import { describe, it, expect, vi } from "vitest";
import { checkBrokenLinks } from "../../src/analysis/broken-links.js";

const SITE_URL = "https://example.com";

function mockHttp(responses: Record<string, number | "error">) {
  return {
    fetch: vi.fn(async (url: string) => {
      const status = responses[url];
      if (status === "error") throw new Error("Network error");
      if (status === undefined) return { status: 200, ok: true } as Response;
      return { status, ok: status < 400 } as Response;
    }),
  };
}

describe("checkBrokenLinks", () => {
  it("returns empty when all links are ok", async () => {
    const links = [
      { href: "/about", text: "About", internal: true },
      { href: "/contact", text: "Contact", internal: true },
    ];
    const http = mockHttp({});
    const result = await checkBrokenLinks(links, http, SITE_URL);
    expect(result).toHaveLength(0);
  });

  it("reports 404 links as broken", async () => {
    const links = [
      { href: "/about", text: "About", internal: true },
      { href: "/missing", text: "Missing", internal: true },
    ];
    const http = mockHttp({ "https://example.com/missing": 404 });
    const result = await checkBrokenLinks(links, http, SITE_URL);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://example.com/missing");
    expect(result[0].status).toBe(404);
    expect(result[0].text).toBe("Missing");
  });

  it("reports 500 links as broken", async () => {
    const links = [
      { href: "/server-error", text: "Error Page", internal: true },
    ];
    const http = mockHttp({ "https://example.com/server-error": 500 });
    const result = await checkBrokenLinks(links, http, SITE_URL);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(500);
  });

  it("reports network errors", async () => {
    const links = [
      { href: "/broken", text: "Broken", internal: true },
    ];
    const http = mockHttp({ "https://example.com/broken": "error" });
    const result = await checkBrokenLinks(links, http, SITE_URL);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("error");
  });

  it("handles absolute internal links", async () => {
    const links = [
      { href: "https://example.com/page", text: "Page", internal: true },
    ];
    const http = mockHttp({ "https://example.com/page": 404 });
    const result = await checkBrokenLinks(links, http, SITE_URL);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://example.com/page");
  });

  it("limits to first 20 links", async () => {
    const links = Array.from({ length: 30 }, (_, i) => ({
      href: `/page-${i}`,
      text: `Page ${i}`,
      internal: true,
    }));
    const http = mockHttp({});
    await checkBrokenLinks(links, http, SITE_URL);
    expect(http.fetch).toHaveBeenCalledTimes(20);
  });

  it("uses HEAD method for requests", async () => {
    const links = [{ href: "/test", text: "Test", internal: true }];
    const http = mockHttp({});
    await checkBrokenLinks(links, http, SITE_URL);
    expect(http.fetch).toHaveBeenCalledWith("https://example.com/test", { method: "HEAD" });
  });
});
