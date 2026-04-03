import { describe, it, expect } from "vitest";
import { validateLicense, isFeatureAllowed, checkLicenseStatus } from "../../src/utils/license.js";
import { createMockCtx } from "../mocks/ctx.js";

function makeKey(payload: Record<string, unknown>): string {
  return btoa(JSON.stringify(payload));
}

describe("validateLicense", () => {
  it("returns free for empty key", () => {
    const info = validateLicense("");
    expect(info.tier).toBe("free");
    expect(info.valid).toBe(false);
  });

  it("returns free for invalid base64", () => {
    const info = validateLicense("not-valid-base64!!!");
    expect(info.tier).toBe("free");
    expect(info.valid).toBe(false);
  });

  it("validates a pro key", () => {
    const key = makeKey({ tier: "pro", exp: "2030-01-01T00:00:00Z" });
    const info = validateLicense(key);
    expect(info.tier).toBe("pro");
    expect(info.valid).toBe(true);
    expect(info.siteLimit).toBe(1);
  });

  it("validates an agency key", () => {
    const key = makeKey({ tier: "agency", exp: "2030-01-01T00:00:00Z" });
    const info = validateLicense(key);
    expect(info.tier).toBe("agency");
    expect(info.valid).toBe(true);
    expect(info.siteLimit).toBe(999);
  });

  it("rejects expired key (past grace period)", () => {
    const key = makeKey({ tier: "pro", exp: "2020-01-01T00:00:00Z" });
    const info = validateLicense(key);
    expect(info.valid).toBe(false);
    expect(info.tier).toBe("free");
  });

  it("accepts key within 7-day grace period", () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const key = makeKey({ tier: "pro", exp: threeDaysAgo.toISOString() });
    const info = validateLicense(key);
    expect(info.valid).toBe(true);
    expect(info.tier).toBe("pro");
  });

  it("accepts key with no expiry", () => {
    const key = makeKey({ tier: "pro" });
    const info = validateLicense(key);
    expect(info.valid).toBe(true);
    expect(info.expiresAt).toBeNull();
  });

  it("rejects unknown tier", () => {
    const key = makeKey({ tier: "ultimate" });
    const info = validateLicense(key);
    expect(info.valid).toBe(false);
  });
});

describe("isFeatureAllowed", () => {
  it("allows free features for free tier", () => {
    expect(isFeatureAllowed("meta-tags", "free")).toBe(true);
    expect(isFeatureAllowed("sitemap", "free")).toBe(true);
    expect(isFeatureAllowed("basic-analysis", "free")).toBe(true);
  });

  it("denies pro features for free tier", () => {
    expect(isFeatureAllowed("advanced-analysis", "free")).toBe(false);
    expect(isFeatureAllowed("social-auto-post", "free")).toBe(false);
  });

  it("allows pro features for pro tier", () => {
    expect(isFeatureAllowed("advanced-analysis", "pro")).toBe(true);
    expect(isFeatureAllowed("social-auto-post", "pro")).toBe(true);
  });

  it("allows all features for agency tier", () => {
    expect(isFeatureAllowed("multi-site", "agency")).toBe(true);
    expect(isFeatureAllowed("advanced-analysis", "agency")).toBe(true);
  });

  it("denies unknown features", () => {
    expect(isFeatureAllowed("nonexistent", "agency")).toBe(false);
  });
});

describe("checkLicenseStatus", () => {
  it("returns free when no key in KV", async () => {
    const ctx = createMockCtx();
    const info = await checkLicenseStatus(ctx);
    expect(info.tier).toBe("free");
    expect(info.valid).toBe(false);
  });

  it("returns pro when valid key in KV", async () => {
    const key = makeKey({ tier: "pro", exp: "2030-01-01T00:00:00Z" });
    const ctx = createMockCtx({ settings: { licenseKey: key } });
    const info = await checkLicenseStatus(ctx);
    expect(info.tier).toBe("pro");
    expect(info.valid).toBe(true);
  });
});
