import { describe, it, expect } from "vitest";
import { checkOutboundLinks } from "../../src/analysis/outbound-links.js";
import type { LinkRef } from "../../src/utils/portable-text.js";

describe("checkOutboundLinks", () => {
  it("warns when no links at all", () => {
    const result = checkOutboundLinks([]);
    expect(result.status).toBe("warn");
    expect(result.id).toBe("outbound-links");
    expect(result.weight).toBe(3);
  });

  it("warns when only internal links", () => {
    const links: LinkRef[] = [
      { href: "/about", text: "About", internal: true },
      { href: "/blog", text: "Blog", internal: true },
    ];
    const result = checkOutboundLinks(links);
    expect(result.status).toBe("warn");
  });

  it("passes with one external link", () => {
    const links: LinkRef[] = [
      { href: "https://external.com", text: "External", internal: false },
    ];
    const result = checkOutboundLinks(links);
    expect(result.status).toBe("pass");
    expect(result.message).toContain("1 outbound link");
  });

  it("passes with multiple external links", () => {
    const links: LinkRef[] = [
      { href: "https://a.com", text: "A", internal: false },
      { href: "https://b.com", text: "B", internal: false },
      { href: "/internal", text: "Internal", internal: true },
    ];
    const result = checkOutboundLinks(links);
    expect(result.status).toBe("pass");
    expect(result.message).toContain("2 outbound links");
  });
});
