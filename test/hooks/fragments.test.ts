import { describe, it, expect } from "vitest";
import { fragmentsHandler } from "../../src/hooks/fragments.js";
import { createMockCtx } from "../mocks/ctx.js";

describe("fragmentsHandler", () => {
  it("injects GA4 scripts when ID configured", async () => {
    const ctx = createMockCtx({
      settings: { googleAnalyticsId: "G-TESTID123" },
    });
    const result = await fragmentsHandler({}, ctx);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    expect(result![0].kind).toBe("external-script");
    expect(result![0].src).toContain("G-TESTID123");
    expect(result![1].kind).toBe("inline-script");
    expect((result![1].code as string)).toContain("G-TESTID123");
  });

  it("injects Google verification meta tag", async () => {
    const ctx = createMockCtx({
      settings: { googleVerification: "abc123verification" },
    });
    const result = await fragmentsHandler({}, ctx);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].kind).toBe("html");
    expect((result![0].html as string)).toContain("abc123verification");
  });

  it("returns null when nothing configured", async () => {
    const ctx = createMockCtx();
    const result = await fragmentsHandler({}, ctx);

    expect(result).toBeNull();
  });

  it("injects both GA4 and verification when both configured", async () => {
    const ctx = createMockCtx({
      settings: {
        googleAnalyticsId: "G-TEST",
        googleVerification: "verify123",
      },
    });
    const result = await fragmentsHandler({}, ctx);

    expect(result).toHaveLength(3);
  });

  it("places scripts in head", async () => {
    const ctx = createMockCtx({
      settings: { googleAnalyticsId: "G-TEST" },
    });
    const result = await fragmentsHandler({}, ctx);

    for (const fragment of result!) {
      expect(fragment.placement).toBe("head");
    }
  });
});
