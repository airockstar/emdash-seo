import { describe, it, expect } from "vitest";
import { analyzeRoutes } from "../../src/routes/analyze.js";
import { createMockCtx } from "../mocks/ctx.js";

function createAnalyzeCtx(contentItem: any, overrides: Record<string, any> = {}, settings: Record<string, unknown> = {}) {
  const ctx = createMockCtx({
    overrides,
    settings,
    contentItems: [contentItem],
  });
  return { ...ctx, input: { contentId: contentItem.id, collection: contentItem.collection } };
}

const sampleContent = {
  id: "post-1",
  collection: "posts",
  title: "A Good SEO Title for Testing Purposes Here",
  description: "A".repeat(140),
  body: [
    { _type: "block", _key: "1", style: "h1", children: [{ _type: "span", text: "Main Heading" }] },
    { _type: "block", _key: "2", style: "normal", children: [{ _type: "span", text: "Some content here about various topics." }] },
  ],
};

describe("analyze route (free)", () => {
  const handler = analyzeRoutes.analyze.handler;

  it("returns score and checks for valid content", async () => {
    const ctx = createAnalyzeCtx(sampleContent);
    const result = await handler(ctx as any);

    expect(result.score).toBeTypeOf("number");
    expect(result.checks).toBeInstanceOf(Array);
    expect(result.checks.length).toBe(9);
  });

  it("stores score in scores collection", async () => {
    const ctx = createAnalyzeCtx(sampleContent);
    await handler(ctx as any);

    const stored = await ctx.storage.scores.get("post-1");
    expect(stored).not.toBeNull();
    expect(stored!.score).toBeTypeOf("number");
  });

  it("returns error for missing content", async () => {
    const ctx = createMockCtx();
    const result = await handler({ ...ctx, input: { contentId: "nonexistent", collection: "posts" } } as any);

    expect(result.error).toBe("not_found");
  });

  it("uses override values when present", async () => {
    const ctx = createAnalyzeCtx(sampleContent, {
      "post-1": { contentId: "post-1", title: "Override Title About Testing", focusKeyword: "testing" },
    });
    const result = await handler(ctx as any);

    const titleCheck = result.checks.find((c: any) => c.id === "title-keyword");
    expect(titleCheck?.status).toBe("pass");
  });
});

describe("analyze/advanced route (paid)", () => {
  const handler = analyzeRoutes["analyze/advanced"].handler;

  it("requires license key", async () => {
    const ctx = createAnalyzeCtx(sampleContent);
    const result = await handler(ctx as any);

    expect(result.error).toBe("pro_required");
  });

  it("rejects invalid license key (JWT required)", async () => {
    // Without a real RSA keypair, any key is rejected as invalid JWT
    const ctx = createAnalyzeCtx(sampleContent, {}, { licenseKey: "fake-key" });
    const result = await handler(ctx as any);

    expect(result.error).toBe("pro_required");
  });
});
