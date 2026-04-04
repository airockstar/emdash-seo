import { describe, it, expect, vi } from "vitest";
import { createMockCtx } from "../mocks/ctx.js";

import * as licenseModule from "../../src/utils/license.js";

vi.mock("../../src/utils/license.js", async (importOriginal) => {
  const actual = await importOriginal<typeof licenseModule>();
  return {
    ...actual,
    checkLicenseStatus: vi.fn(actual.checkLicenseStatus),
  };
});

// Import socialRoutes AFTER the mock is set up
const { socialRoutes } = await import("../../src/routes/social.js");
const { checkLicenseStatus } = licenseModule as { checkLicenseStatus: ReturnType<typeof vi.fn> };

function mockProLicense() {
  checkLicenseStatus.mockResolvedValue({
    tier: "pro" as const,
    valid: true,
    expiresAt: null,
    siteLimit: 1,
  });
}

function mockFreeLicense() {
  checkLicenseStatus.mockResolvedValue({
    tier: "free" as const,
    valid: false,
    expiresAt: null,
    siteLimit: 1,
  });
}

function createSocialCtx(settings: Record<string, unknown> = {}) {
  const ctx = createMockCtx({
    settings: {
      socialPostTemplate: "Check out: {title} {url}",
      twitterApiKey: "tw-key",
      twitterApiSecret: "tw-secret",
      blueskyHandle: "user.bsky.social",
      blueskyAppPassword: "bsky-pass",
      ...settings,
    },
    contentItems: [
      { id: "p1", collection: "posts", slug: "test-post", title: "Test Post", description: "Desc" },
    ],
  });

  // Mock successful Twitter response
  ctx.http.fetch = vi.fn(async (url: string) => {
    if (url.includes("twitter.com")) {
      return new Response(JSON.stringify({ data: { id: "tw-123" } }), { status: 200 });
    }
    if (url.includes("createSession")) {
      return new Response(JSON.stringify({ did: "did:plc:abc", accessJwt: "jwt-token" }), { status: 200 });
    }
    if (url.includes("createRecord")) {
      return new Response(JSON.stringify({ uri: "at://post/123" }), { status: 200 });
    }
    return new Response("Not found", { status: 404 });
  }) as any;

  return ctx;
}

describe("social/post route", () => {
  const handler = socialRoutes["social/post"].handler;

  it("returns pro_required when no license key is set", async () => {
    mockFreeLicense();
    const ctx = createMockCtx({
      contentItems: [
        { id: "p1", collection: "posts", slug: "test-post", title: "Test Post", description: "Desc" },
      ],
    });
    const result = await handler({
      ...ctx,
      input: { contentId: "p1", platforms: ["twitter"] },
    } as any);

    expect(result.error).toBe("pro_required");
    expect(result.message).toBe("Social posting requires a Pro license");
  });

  it("returns pro_required for free-tier users", async () => {
    mockFreeLicense();
    const ctx = createMockCtx({
      settings: {
        licenseKey: "not-a-valid-jwt",
        twitterApiKey: "tw-key",
        twitterApiSecret: "tw-secret",
      },
      contentItems: [
        { id: "p1", collection: "posts", slug: "test-post", title: "Test Post", description: "Desc" },
      ],
    });
    const result = await handler({
      ...ctx,
      input: { contentId: "p1", platforms: ["twitter"] },
    } as any);

    expect(result.error).toBe("pro_required");
    expect(result.message).toBe("Social posting requires a Pro license");
  });

  it("posts to twitter successfully", async () => {
    mockProLicense();
    const ctx = createSocialCtx();
    const result = await handler({
      ...ctx,
      input: { contentId: "p1", platforms: ["twitter"] },
    } as any);

    expect(result.results).toHaveLength(1);
    expect(result.results[0].success).toBe(true);
    expect(result.results[0].platform).toBe("twitter");
  });

  it("posts to bluesky successfully", async () => {
    mockProLicense();
    const ctx = createSocialCtx();
    const result = await handler({
      ...ctx,
      input: { contentId: "p1", platforms: ["bluesky"] },
    } as any);

    expect(result.results).toHaveLength(1);
    expect(result.results[0].success).toBe(true);
    expect(result.results[0].platform).toBe("bluesky");
  });

  it("skips already-posted content (dedup)", async () => {
    mockProLicense();
    const ctx = createSocialCtx();
    // First post
    await handler({ ...ctx, input: { contentId: "p1", platforms: ["twitter"] } } as any);
    // Second attempt
    const result = await handler({ ...ctx, input: { contentId: "p1", platforms: ["twitter"] } } as any);

    expect(result.results[0].skipped).toBe(true);
  });

  it("returns error for missing content", async () => {
    mockProLicense();
    const ctx = createSocialCtx();
    const result = await handler({
      ...ctx,
      input: { contentId: "nonexistent", platforms: ["twitter"] },
    } as any);

    expect(result.error).toBe("not_found");
  });

  it("skips unconfigured platforms", async () => {
    mockProLicense();
    const ctx = createSocialCtx({ twitterApiKey: "", twitterApiSecret: "" });
    const result = await handler({
      ...ctx,
      input: { contentId: "p1", platforms: ["twitter"] },
    } as any);

    expect(result.results[0].skipped).toBe(true);
    expect(result.results[0].reason).toBe("Not configured");
  });
});

describe("social/history route", () => {
  const handler = socialRoutes["social/history"].handler;

  it("returns empty history", async () => {
    const ctx = createMockCtx();
    const result = await handler({ ...ctx, input: {} } as any);
    expect(result.items).toHaveLength(0);
  });
});
