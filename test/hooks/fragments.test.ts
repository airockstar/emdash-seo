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
    expect(result!.filter((f) => f.key === "gtag-script" || f.key === "gtag-config")).toHaveLength(2);
    expect(result![0].src).toContain("G-TESTID123");
  });

  it("injects Google verification meta tag", async () => {
    const ctx = createMockCtx({
      settings: { googleVerification: "abc123verification" },
    });
    const result = await fragmentsHandler({}, ctx);

    expect(result).not.toBeNull();
    const tag = result!.find((f) => f.key === "google-verification");
    expect(tag).toBeDefined();
    expect((tag!.html as string)).toContain("abc123verification");
  });

  it("injects Bing verification meta tag", async () => {
    const ctx = createMockCtx({
      settings: { bingVerification: "bing123" },
    });
    const result = await fragmentsHandler({}, ctx);

    const tag = result!.find((f) => f.key === "bing-verification");
    expect(tag).toBeDefined();
    expect((tag!.html as string)).toContain("msvalidate.01");
    expect((tag!.html as string)).toContain("bing123");
  });

  it("injects Pinterest verification meta tag", async () => {
    const ctx = createMockCtx({
      settings: { pinterestVerification: "pin456" },
    });
    const result = await fragmentsHandler({}, ctx);

    const tag = result!.find((f) => f.key === "pinterest-verification");
    expect(tag).toBeDefined();
    expect((tag!.html as string)).toContain("p:domain_verify");
  });

  it("injects Yandex verification meta tag", async () => {
    const ctx = createMockCtx({
      settings: { yandexVerification: "yandex789" },
    });
    const result = await fragmentsHandler({}, ctx);

    const tag = result!.find((f) => f.key === "yandex-verification");
    expect(tag).toBeDefined();
    expect((tag!.html as string)).toContain("yandex-verification");
  });

  it("returns null when nothing configured", async () => {
    const ctx = createMockCtx();
    const result = await fragmentsHandler({}, ctx);

    expect(result).toBeNull();
  });

  it("injects all providers when all configured", async () => {
    const ctx = createMockCtx({
      settings: {
        googleAnalyticsId: "G-TEST",
        googleVerification: "gv",
        bingVerification: "bv",
        pinterestVerification: "pv",
        yandexVerification: "yv",
      },
    });
    const result = await fragmentsHandler({}, ctx);

    // 2 GA scripts + 4 verification tags
    expect(result).toHaveLength(6);
  });

  it("rejects invalid GA ID format", async () => {
    const ctx = createMockCtx({
      settings: { googleAnalyticsId: "invalid<script>" },
    });
    const result = await fragmentsHandler({}, ctx);

    expect(result).toBeNull();
  });

  it("rejects verification codes with special characters", async () => {
    const ctx = createMockCtx({
      settings: { googleVerification: '<script>alert("xss")</script>' },
    });
    const result = await fragmentsHandler({}, ctx);

    expect(result).toBeNull();
  });

  it("places all fragments in head", async () => {
    const ctx = createMockCtx({
      settings: { googleAnalyticsId: "G-TEST", bingVerification: "bv" },
    });
    const result = await fragmentsHandler({}, ctx);

    for (const fragment of result!) {
      expect(fragment.placement).toBe("head");
    }
  });
});
