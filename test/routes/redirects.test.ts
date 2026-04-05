import { describe, it, expect, beforeEach } from "vitest";
import { createMockCtx } from "../mocks/ctx.js";
import { redirectRoutes } from "../../src/routes/redirects.js";

describe("redirectRoutes", () => {
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  describe("redirects/save", () => {
    it("saves a redirect with generated id", async () => {
      const handler = redirectRoutes["redirects/save"].handler;
      const result = await handler({ ...ctx, input: { from: "/old", to: "/new", status: 301 } });

      expect(result.success).toBe(true);
      expect(result.id).toMatch(/^redirect-/);
      expect(ctx.storage.redirects.put).toHaveBeenCalledWith(
        expect.stringMatching(/^redirect-/),
        expect.objectContaining({ from: "/old", to: "/new", status: 301 }),
      );
    });

    it("uses provided id when given", async () => {
      const handler = redirectRoutes["redirects/save"].handler;
      const result = await handler({ ...ctx, input: { id: "r-1", from: "/old", to: "/new", status: 302 } });

      expect(result.id).toBe("r-1");
      expect(ctx.storage.redirects.put).toHaveBeenCalledWith(
        "r-1",
        expect.objectContaining({ from: "/old", to: "/new", status: 302 }),
      );
    });

    it("stores createdAt timestamp", async () => {
      const handler = redirectRoutes["redirects/save"].handler;
      await handler({ ...ctx, input: { from: "/a", to: "/b", status: 301 } });

      const putCall = ctx.storage.redirects.put.mock.calls[0];
      expect(putCall[1].createdAt).toBeDefined();
    });
  });

  describe("redirects/list", () => {
    it("returns list of redirects", async () => {
      const handler = redirectRoutes["redirects/list"].handler;
      const result = await handler({ ...ctx, input: {} });

      expect(result.items).toBeDefined();
      expect(ctx.storage.redirects.query).toHaveBeenCalled();
    });

    it("passes limit and cursor to query", async () => {
      const handler = redirectRoutes["redirects/list"].handler;
      await handler({ ...ctx, input: { limit: 10, cursor: "abc" } });

      expect(ctx.storage.redirects.query).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, cursor: "abc" }),
      );
    });
  });

  describe("redirects/delete", () => {
    it("deletes a redirect by id", async () => {
      const handler = redirectRoutes["redirects/delete"].handler;
      const result = await handler({ ...ctx, input: { id: "r-1" } });

      expect(result.success).toBe(true);
      expect(ctx.storage.redirects.delete).toHaveBeenCalledWith("r-1");
    });
  });
});
