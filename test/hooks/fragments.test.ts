import { describe, it, expect } from "vitest";
import { fragmentsHandler } from "../../src/hooks/fragments.js";
import { createMockCtx } from "../mocks/ctx.js";

describe("fragmentsHandler", () => {
  describe("GA4", () => {
    it("injects GA4 scripts when ID configured", async () => {
      const ctx = createMockCtx({
        settings: { googleAnalyticsId: "G-TESTID123" },
      });
      const result = await fragmentsHandler({}, ctx);

      const scripts = result!.filter(
        (f) => f.key === "gtag-script" || f.key === "gtag-config",
      );
      expect(scripts).toHaveLength(2);
      expect(scripts[0].src).toContain("G-TESTID123");
    });

    it("rejects invalid GA ID format", async () => {
      const ctx = createMockCtx({
        settings: { googleAnalyticsId: "invalid<script>" },
      });
      const result = await fragmentsHandler({}, ctx);
      expect(result).toBeNull();
    });
  });

  describe("GTM", () => {
    it("injects GTM script and noscript", async () => {
      const ctx = createMockCtx({
        settings: { gtmContainerId: "GTM-ABC123" },
      });
      const result = await fragmentsHandler({}, ctx);

      const script = result!.find((f) => f.key === "gtm-script");
      const noscript = result!.find((f) => f.key === "gtm-noscript");
      expect(script).toBeDefined();
      expect(script!.placement).toBe("head");
      expect((script!.code as string)).toContain("GTM-ABC123");
      expect(noscript).toBeDefined();
      expect(noscript!.placement).toBe("body:start");
    });

    it("rejects invalid GTM ID", async () => {
      const ctx = createMockCtx({
        settings: { gtmContainerId: "not-a-gtm-id" },
      });
      const result = await fragmentsHandler({}, ctx);
      expect(result).toBeNull();
    });
  });

  describe("Cloudflare Analytics", () => {
    it("injects CF beacon script", async () => {
      const ctx = createMockCtx({
        settings: { cfAnalyticsToken: "abc123token" },
      });
      const result = await fragmentsHandler({}, ctx);

      const beacon = result!.find((f) => f.key === "cf-analytics");
      expect(beacon).toBeDefined();
      expect(beacon!.placement).toBe("body:end");
    });
  });

  describe("Facebook Pixel", () => {
    it("injects FB pixel script and noscript", async () => {
      const ctx = createMockCtx({
        settings: { facebookPixelId: "123456789" },
      });
      const result = await fragmentsHandler({}, ctx);

      const script = result!.find((f) => f.key === "fb-pixel");
      const noscript = result!.find((f) => f.key === "fb-pixel-noscript");
      expect(script).toBeDefined();
      expect((script!.code as string)).toContain("123456789");
      expect(noscript).toBeDefined();
    });
  });

  describe("Custom Scripts", () => {
    it("injects custom head scripts", async () => {
      const ctx = createMockCtx({
        settings: { customHeadScripts: '<script>console.log("head")</script>' },
      });
      const result = await fragmentsHandler({}, ctx);

      const custom = result!.find((f) => f.key === "custom-head-scripts");
      expect(custom).toBeDefined();
      expect(custom!.placement).toBe("head");
    });

    it("injects custom body scripts", async () => {
      const ctx = createMockCtx({
        settings: { customBodyScripts: '<script>console.log("body")</script>' },
      });
      const result = await fragmentsHandler({}, ctx);

      const custom = result!.find((f) => f.key === "custom-body-scripts");
      expect(custom).toBeDefined();
      expect(custom!.placement).toBe("body:end");
    });
  });

  describe("General", () => {
    it("returns null when nothing configured", async () => {
      const ctx = createMockCtx();
      const result = await fragmentsHandler({}, ctx);
      expect(result).toBeNull();
    });

    it("combines all analytics providers", async () => {
      const ctx = createMockCtx({
        settings: {
          googleAnalyticsId: "G-TEST",
          gtmContainerId: "GTM-TEST",
          cfAnalyticsToken: "cftoken",
          facebookPixelId: "fbpixel",
          customHeadScripts: "<script>head</script>",
          customBodyScripts: "<script>body</script>",
        },
      });
      const result = await fragmentsHandler({}, ctx);

      // GA4(2) + GTM(2) + CF(1) + FB(2) + custom(2) = 9
      expect(result).toHaveLength(9);
    });

    it("rejects verification codes with special characters (returns null if only verification set)", async () => {
      const ctx = createMockCtx({
        settings: { googleAnalyticsId: '<script>alert("xss")</script>' },
      });
      const result = await fragmentsHandler({}, ctx);
      expect(result).toBeNull();
    });
  });
});
