import { describe, it, expect, vi } from "vitest";
import { socialRoutes } from "../../src/routes/social.js";
import { createMockCtx } from "../mocks/ctx.js";

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

  it("posts to twitter successfully", async () => {
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
    const ctx = createSocialCtx();
    // First post
    await handler({ ...ctx, input: { contentId: "p1", platforms: ["twitter"] } } as any);
    // Second attempt
    const result = await handler({ ...ctx, input: { contentId: "p1", platforms: ["twitter"] } } as any);

    expect(result.results[0].skipped).toBe(true);
  });

  it("returns error for missing content", async () => {
    const ctx = createSocialCtx();
    const result = await handler({
      ...ctx,
      input: { contentId: "nonexistent", platforms: ["twitter"] },
    } as any);

    expect(result.error).toBe("not_found");
  });

  it("skips unconfigured platforms", async () => {
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
