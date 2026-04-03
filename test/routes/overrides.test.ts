import { describe, it, expect, beforeEach } from "vitest";
import { overrideRoutes } from "../../src/routes/overrides.js";
import { createMockCtx } from "../mocks/ctx.js";

describe("override routes", () => {
  let ctx: ReturnType<typeof createMockCtx> & { input: any };

  beforeEach(() => {
    ctx = { ...createMockCtx(), input: {} };
  });

  describe("overrides/save", () => {
    it("saves and retrieves overrides", async () => {
      ctx.input = {
        contentId: "post-1",
        collection: "posts",
        title: "Custom Title",
        description: "Custom desc",
      };
      const saveResult = await overrideRoutes["overrides/save"].handler(ctx);
      expect(saveResult.success).toBe(true);

      ctx.input = { contentId: "post-1" };
      const getResult = await overrideRoutes["overrides/get"].handler(ctx);
      expect(getResult.overrides?.title).toBe("Custom Title");
    });

    it("saves with focusKeyword", async () => {
      ctx.input = {
        contentId: "post-2",
        collection: "posts",
        focusKeyword: "seo plugin",
      };
      await overrideRoutes["overrides/save"].handler(ctx);

      ctx.input = { contentId: "post-2" };
      const result = await overrideRoutes["overrides/get"].handler(ctx);
      expect(result.overrides?.focusKeyword).toBe("seo plugin");
    });

    it("saves with partial fields", async () => {
      ctx.input = {
        contentId: "post-3",
        collection: "posts",
        robots: "noindex",
      };
      await overrideRoutes["overrides/save"].handler(ctx);

      ctx.input = { contentId: "post-3" };
      const result = await overrideRoutes["overrides/get"].handler(ctx);
      expect(result.overrides?.robots).toBe("noindex");
      expect(result.overrides?.title).toBeUndefined();
    });
  });

  describe("overrides/get", () => {
    it("returns null for missing item", async () => {
      ctx.input = { contentId: "nonexistent" };
      const result = await overrideRoutes["overrides/get"].handler(ctx);
      expect(result.overrides).toBeNull();
    });
  });

  describe("overrides/list", () => {
    it("lists all overrides", async () => {
      // Add some data
      ctx.input = { contentId: "a", collection: "posts", title: "A" };
      await overrideRoutes["overrides/save"].handler(ctx);
      ctx.input = { contentId: "b", collection: "pages", title: "B" };
      await overrideRoutes["overrides/save"].handler(ctx);

      ctx.input = {};
      const result = await overrideRoutes["overrides/list"].handler(ctx);
      expect(result.items.length).toBe(2);
    });

    it("filters by collection", async () => {
      ctx.input = { contentId: "a", collection: "posts", title: "A" };
      await overrideRoutes["overrides/save"].handler(ctx);
      ctx.input = { contentId: "b", collection: "pages", title: "B" };
      await overrideRoutes["overrides/save"].handler(ctx);

      ctx.input = { collection: "posts" };
      const result = await overrideRoutes["overrides/list"].handler(ctx);
      expect(result.items.length).toBe(1);
      expect(result.items[0].data.collection).toBe("posts");
    });
  });

  describe("overrides/delete", () => {
    it("deletes existing overrides", async () => {
      ctx.input = { contentId: "del-1", collection: "posts", title: "X" };
      await overrideRoutes["overrides/save"].handler(ctx);

      ctx.input = { contentId: "del-1" };
      const result = await overrideRoutes["overrides/delete"].handler(ctx);
      expect(result.success).toBe(true);
      expect(result.deleted).toBe(true);

      const getResult = await overrideRoutes["overrides/get"].handler(ctx);
      expect(getResult.overrides).toBeNull();
    });

    it("returns deleted false for missing item", async () => {
      ctx.input = { contentId: "nonexistent" };
      const result = await overrideRoutes["overrides/delete"].handler(ctx);
      expect(result.success).toBe(true);
      expect(result.deleted).toBe(false);
    });
  });
});
