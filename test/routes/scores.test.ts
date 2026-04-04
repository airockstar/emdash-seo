import { describe, it, expect } from "vitest";
import { scoresRoutes } from "../../src/routes/scores.js";
import { createMockCtx } from "../mocks/ctx.js";

describe("scores/list route", () => {
  const handler = scoresRoutes["scores/list"].handler;

  it("returns items from storage", async () => {
    const ctx = createMockCtx({
      scores: {
        "post-1": {
          contentId: "post-1",
          collection: "posts",
          score: 85,
          checks: [],
          analyzedAt: "2026-01-01T00:00:00Z",
        } as any,
        "post-2": {
          contentId: "post-2",
          collection: "posts",
          score: 70,
          checks: [],
          analyzedAt: "2026-01-01T00:00:00Z",
        } as any,
      },
    });

    const result = await handler({ ...ctx, input: {} } as any);

    expect(result.items).toHaveLength(2);
  });

  it("filters by collection", async () => {
    const ctx = createMockCtx({
      scores: {
        "post-1": {
          contentId: "post-1",
          collection: "posts",
          score: 85,
          checks: [],
          analyzedAt: "2026-01-01T00:00:00Z",
        } as any,
        "page-1": {
          contentId: "page-1",
          collection: "pages",
          score: 60,
          checks: [],
          analyzedAt: "2026-01-01T00:00:00Z",
        } as any,
      },
    });

    const result = await handler({
      ...ctx,
      input: { collection: "posts" },
    } as any);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].data.collection).toBe("posts");
  });

  it("passes cursor and limit", async () => {
    const ctx = createMockCtx({
      scores: {
        "post-1": {
          contentId: "post-1",
          collection: "posts",
          score: 85,
          checks: [],
          analyzedAt: "2026-01-01T00:00:00Z",
        } as any,
      },
    });

    const result = await handler({
      ...ctx,
      input: { cursor: "abc", limit: 10 },
    } as any);

    expect(ctx.storage.scores.query).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 10,
        cursor: "abc",
      }),
    );
    expect(result.items).toBeDefined();
  });
});
