import { describe, it, expect, vi } from "vitest";

import * as licenseModule from "../../src/utils/license.js";

vi.mock("../../src/utils/license.js", async (importOriginal) => {
  const actual = await importOriginal<typeof licenseModule>();
  return {
    ...actual,
    checkLicenseStatus: vi.fn(actual.checkLicenseStatus),
  };
});

const { contentAfterSaveHook } = await import("../../src/hooks/content-after-save.js");
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

function createCtx(opts: {
  overrides?: Record<string, any>;
  kvSettings?: Record<string, any>;
  existingSocialPosts?: Record<string, any>;
} = {}) {
  const kvStore = new Map<string, unknown>(
    Object.entries(opts.kvSettings ?? {}),
  );

  return {
    storage: {
      overrides: {
        get: vi.fn(async (id: string) => opts.overrides?.[id] ?? null),
      },
      scores: {
        put: vi.fn(),
      },
      socialPosts: {
        query: vi.fn(async () => ({
          items: Object.entries(opts.existingSocialPosts ?? {}).map(
            ([id, data]) => ({ id, data }),
          ),
        })),
        put: vi.fn(),
      },
    },
    kv: {
      get: vi.fn(async (key: string) => kvStore.get(key) ?? null),
    },
    site: { url: "https://example.com" },
    log: { warn: vi.fn(), info: vi.fn() },
    http: { fetch: vi.fn() },
  };
}

const baseContent = {
  id: "post-1",
  title: "Test Post",
  description: "A test post description",
  slug: "test-post",
  status: "published",
  body: [
    {
      _type: "block",
      _key: "1",
      style: "h1",
      children: [{ _type: "span", text: "Heading" }],
    },
  ],
};

describe("contentAfterSaveHook", () => {
  it("auto-analyzes content on save and stores score", async () => {
    const ctx = createCtx();
    await contentAfterSaveHook(
      { content: baseContent, collection: "posts", isNew: false },
      ctx,
    );

    expect(ctx.storage.scores.put).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        contentId: "post-1",
        collection: "posts",
        score: expect.any(Number),
        checks: expect.any(Array),
        analyzedAt: expect.any(String),
      }),
    );
  });

  it("auto-posts to social when isNew + published + enableAutoPost", async () => {
    mockProLicense();
    const ctx = createCtx({
      kvSettings: {
        "settings:enableAutoPost": true,
        "settings:twitterApiKey": "key",
        "settings:twitterApiSecret": "secret",
        "settings:socialPostTemplate": "New: {title}",
      },
    });

    // Mock successful Twitter auth + post
    ctx.http.fetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "tok" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: "tw-123" } }), {
          status: 200,
        }),
      );

    await contentAfterSaveHook(
      { content: baseContent, collection: "posts", isNew: true },
      ctx,
    );

    expect(ctx.storage.socialPosts.put).toHaveBeenCalledWith(
      "post-1-twitter",
      expect.objectContaining({
        contentId: "post-1",
        platform: "twitter",
        postId: "tw-123",
      }),
    );
  });

  it("skips auto-post when license is free tier", async () => {
    mockFreeLicense();
    const ctx = createCtx({
      kvSettings: {
        "settings:enableAutoPost": true,
        "settings:twitterApiKey": "key",
        "settings:twitterApiSecret": "secret",
      },
    });

    await contentAfterSaveHook(
      { content: baseContent, collection: "posts", isNew: true },
      ctx,
    );

    expect(ctx.http.fetch).not.toHaveBeenCalled();
    expect(ctx.storage.socialPosts.put).not.toHaveBeenCalled();
  });

  it("skips social posting when not new", async () => {
    const ctx = createCtx({
      kvSettings: { "settings:enableAutoPost": true },
    });

    await contentAfterSaveHook(
      { content: baseContent, collection: "posts", isNew: false },
      ctx,
    );

    expect(ctx.storage.socialPosts.put).not.toHaveBeenCalled();
  });

  it("skips social posting when autoPost disabled", async () => {
    const ctx = createCtx({
      kvSettings: { "settings:enableAutoPost": false },
    });

    await contentAfterSaveHook(
      { content: baseContent, collection: "posts", isNew: true },
      ctx,
    );

    expect(ctx.storage.socialPosts.put).not.toHaveBeenCalled();
  });

  it("dedup: skips if already posted", async () => {
    mockProLicense();
    const ctx = createCtx({
      kvSettings: {
        "settings:enableAutoPost": true,
        "settings:twitterApiKey": "key",
        "settings:twitterApiSecret": "secret",
      },
      existingSocialPosts: {
        "post-1-twitter": {
          contentId: "post-1",
          platform: "twitter",
          postId: "existing",
        },
      },
    });

    await contentAfterSaveHook(
      { content: baseContent, collection: "posts", isNew: true },
      ctx,
    );

    // socialPosts.put should not be called because the post already exists
    expect(ctx.storage.socialPosts.put).not.toHaveBeenCalled();
  });

  it("logs warning on post failure", async () => {
    mockProLicense();
    const ctx = createCtx({
      kvSettings: {
        "settings:enableAutoPost": true,
        "settings:twitterApiKey": "key",
        "settings:twitterApiSecret": "secret",
      },
    });

    // Mock auth failure
    ctx.http.fetch.mockResolvedValueOnce(
      new Response("Unauthorized", { status: 401 }),
    );

    await contentAfterSaveHook(
      { content: baseContent, collection: "posts", isNew: true },
      ctx,
    );

    expect(ctx.log.warn).toHaveBeenCalledWith(
      expect.stringContaining("Auto-post to twitter failed"),
    );
  });
});
