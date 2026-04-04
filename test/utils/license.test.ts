import { describe, it, expect } from "vitest";
import { validateLicense, isFeatureAllowed, checkLicenseStatus } from "../../src/utils/license.js";
import { createMockCtx } from "../mocks/ctx.js";

describe("validateLicense (JWT only)", () => {
  it("returns free for empty key", async () => {
    const info = await validateLicense("");
    expect(info.tier).toBe("free");
    expect(info.valid).toBe(false);
  });

  it("returns free for invalid token", async () => {
    const info = await validateLicense("not-a-jwt");
    expect(info.valid).toBe(false);
  });

  it("rejects JWT with fake signature", async () => {
    // Without a real RSA keypair configured, all JWTs are rejected
    const header = btoa(JSON.stringify({ alg: "RS256" })).replace(/=/g, "");
    const payload = btoa(JSON.stringify({ tier: "pro", exp: 9999999999 })).replace(/=/g, "");
    const sig = btoa("fake").replace(/=/g, "");
    const info = await validateLicense(`${header}.${payload}.${sig}`);
    expect(info.valid).toBe(false);
    expect(info.tier).toBe("free");
  });

  it("rejects malformed JWT", async () => {
    const info = await validateLicense("a.b.c");
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

  it("allows internal-link-suggestions for pro tier", () => {
    expect(isFeatureAllowed("internal-link-suggestions", "pro")).toBe(true);
    expect(isFeatureAllowed("internal-link-suggestions", "free")).toBe(false);
  });
});

describe("checkLicenseStatus", () => {
  it("returns free when no key in KV", async () => {
    const ctx = createMockCtx();
    const info = await checkLicenseStatus(ctx);
    expect(info.tier).toBe("free");
    expect(info.valid).toBe(false);
  });
});
