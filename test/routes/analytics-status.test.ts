import { describe, it, expect } from "vitest";
import { analyticsStatusRoutes } from "../../src/routes/analytics-status.js";
import { createMockCtx } from "../mocks/ctx.js";

describe("analytics/status route", () => {
  const handler = analyticsStatusRoutes["analytics/status"].handler;

  it("counts missing fields across content", async () => {
    const ctx = createMockCtx({
      contentItems: [
        { id: "1", collection: "posts", slug: "a", title: "Post A", description: "Desc A", image: "img.jpg" },
        { id: "2", collection: "posts", slug: "b", title: "Post B" },
        { id: "3", collection: "posts", slug: "c" },
      ],
    });
    const result = await handler(ctx as any);

    expect(result.total).toBe(3);
    expect(result.missingTitle).toBe(1);
    expect(result.missingDescription).toBe(2);
    expect(result.missingOgImage).toBe(2);
  });

  it("accounts for overrides filling gaps", async () => {
    const ctx = createMockCtx({
      contentItems: [
        { id: "1", collection: "posts", slug: "a" },
        { id: "2", collection: "posts", slug: "b" },
      ],
      overrides: {
        "1": { contentId: "1", title: "Override Title", description: "Override Desc", ogImage: "override.jpg" },
      },
    });
    const result = await handler(ctx as any);

    expect(result.total).toBe(2);
    expect(result.missingTitle).toBe(1);
    expect(result.missingDescription).toBe(1);
    expect(result.missingOgImage).toBe(1);
    expect(result.withOverrides).toBe(1);
    expect(result.withoutOverrides).toBe(1);
  });

  it("handles empty content list", async () => {
    const ctx = createMockCtx({ contentItems: [] });
    const result = await handler(ctx as any);

    expect(result.total).toBe(0);
    expect(result.missingTitle).toBe(0);
    expect(result.missingDescription).toBe(0);
    expect(result.missingOgImage).toBe(0);
  });

  it("returns all zeros when everything is filled", async () => {
    const ctx = createMockCtx({
      contentItems: [
        { id: "1", collection: "posts", slug: "a", title: "T", description: "D", image: "I" },
      ],
    });
    const result = await handler(ctx as any);

    expect(result.missingTitle).toBe(0);
    expect(result.missingDescription).toBe(0);
    expect(result.missingOgImage).toBe(0);
  });
});
