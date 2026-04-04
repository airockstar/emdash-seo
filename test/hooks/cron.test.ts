import { describe, it, expect, vi } from "vitest";
import { cronHook } from "../../src/hooks/cron.js";

function createCronCtx(contentItems: any[] = []) {
  const overridesMap = new Map<string, any>();

  return {
    content: {
      list: vi.fn(async () => ({
        items: contentItems.map((c) => ({ id: c.id, data: c })),
        nextCursor: undefined,
      })),
    },
    storage: {
      overrides: {
        getMany: vi.fn(async () => overridesMap),
      },
      scores: {
        putMany: vi.fn(),
      },
    },
  };
}

const sampleContent = {
  id: "post-1",
  title: "Test Post Title That Is Long Enough",
  description: "A description that should be at least long enough to test",
  collection: "posts",
  body: [
    {
      _type: "block",
      _key: "1",
      style: "h1",
      children: [{ _type: "span", text: "Heading" }],
    },
  ],
};

describe("cronHook", () => {
  it("only runs for 'recalculate-scores' event name", async () => {
    const ctx = createCronCtx([sampleContent]);
    await cronHook({ name: "recalculate-scores" }, ctx);

    expect(ctx.content.list).toHaveBeenCalled();
  });

  it("ignores other event names", async () => {
    const ctx = createCronCtx([sampleContent]);
    await cronHook({ name: "other-event" }, ctx);

    expect(ctx.content.list).not.toHaveBeenCalled();
  });

  it("processes all content items", async () => {
    const items = [
      { ...sampleContent, id: "post-1" },
      { ...sampleContent, id: "post-2" },
      { ...sampleContent, id: "post-3" },
    ];
    const ctx = createCronCtx(items);
    await cronHook({ name: "recalculate-scores" }, ctx);

    expect(ctx.storage.scores.putMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "post-1" }),
        expect.objectContaining({ id: "post-2" }),
        expect.objectContaining({ id: "post-3" }),
      ]),
    );
  });

  it("uses batch putMany for scores", async () => {
    const ctx = createCronCtx([sampleContent]);
    await cronHook({ name: "recalculate-scores" }, ctx);

    expect(ctx.storage.scores.putMany).toHaveBeenCalledTimes(1);
    expect(ctx.storage.scores.putMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "post-1",
          data: expect.objectContaining({
            contentId: "post-1",
            score: expect.any(Number),
            checks: expect.any(Array),
          }),
        }),
      ]),
    );
  });

  it("handles empty content list", async () => {
    const ctx = createCronCtx([]);
    await cronHook({ name: "recalculate-scores" }, ctx);

    expect(ctx.storage.scores.putMany).not.toHaveBeenCalled();
  });
});
