import { describe, it, expect, vi } from "vitest";
import { licenseRoutes } from "../../src/routes/license.js";
import { createMockCtx } from "../mocks/ctx.js";

// Mock the license utility to control validation results
vi.mock("../../src/utils/license.js", () => ({
  validateLicense: vi.fn(async (key: string) => {
    if (key === "valid-key") {
      return { tier: "pro", valid: true, expiresAt: "2027-01-01T00:00:00Z", siteLimit: 1 };
    }
    return { tier: "free", valid: false, expiresAt: null, siteLimit: 1 };
  }),
  checkLicenseStatus: vi.fn(async (ctx: any) => {
    const key = await ctx.kv.get("settings:licenseKey");
    if (key === "valid-key") {
      return { tier: "pro", valid: true, expiresAt: "2027-01-01T00:00:00Z", siteLimit: 1 };
    }
    return { tier: "free", valid: false, expiresAt: null, siteLimit: 1 };
  }),
}));

describe("license/validate route", () => {
  const handler = licenseRoutes["license/validate"].handler;

  it("stores valid key in KV", async () => {
    const ctx = createMockCtx();
    const result = await handler({ ...ctx, input: { key: "valid-key" } } as any);

    expect(result.valid).toBe(true);
    expect(result.tier).toBe("pro");
    expect(ctx.kv.set).toHaveBeenCalledWith("settings:licenseKey", "valid-key");
  });

  it("rejects invalid key", async () => {
    const ctx = createMockCtx();
    const result = await handler({ ...ctx, input: { key: "bad-key" } } as any);

    expect(result.valid).toBe(false);
    expect(result.tier).toBe("free");
    expect(ctx.kv.set).not.toHaveBeenCalled();
  });
});

describe("license/status route", () => {
  const handler = licenseRoutes["license/status"].handler;

  it("returns current license info", async () => {
    const ctx = createMockCtx({ settings: { licenseKey: "valid-key" } });
    const result = await handler(ctx as any);

    expect(result).toEqual(
      expect.objectContaining({
        tier: expect.any(String),
        valid: expect.any(Boolean),
      }),
    );
  });
});
