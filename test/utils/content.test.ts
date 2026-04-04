import { describe, it, expect, vi } from "vitest";
import { fetchAllContent } from "../../src/utils/content.js";

describe("fetchAllContent", () => {
  it("returns all items from single page", async () => {
    const ctx = {
      content: {
        list: vi.fn(async () => ({
          items: [
            { id: "1", data: { title: "Post 1" } },
            { id: "2", data: { title: "Post 2" } },
          ],
          nextCursor: undefined,
        })),
      },
    };

    const result = await fetchAllContent(ctx);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
  });

  it("paginates through multiple pages using cursor", async () => {
    const ctx = {
      content: {
        list: vi
          .fn()
          .mockResolvedValueOnce({
            items: [{ id: "1", data: { title: "Post 1" } }],
            nextCursor: "cursor-1",
          })
          .mockResolvedValueOnce({
            items: [{ id: "2", data: { title: "Post 2" } }],
            nextCursor: "cursor-2",
          })
          .mockResolvedValueOnce({
            items: [{ id: "3", data: { title: "Post 3" } }],
            nextCursor: undefined,
          }),
      },
    };

    const result = await fetchAllContent(ctx);

    expect(result).toHaveLength(3);
    expect(ctx.content.list).toHaveBeenCalledTimes(3);
    // Second call should pass cursor
    expect(ctx.content.list).toHaveBeenNthCalledWith(2, { cursor: "cursor-1" });
    expect(ctx.content.list).toHaveBeenNthCalledWith(3, { cursor: "cursor-2" });
  });

  it("returns empty array when no content", async () => {
    const ctx = {
      content: {
        list: vi.fn(async () => ({
          items: [],
          nextCursor: undefined,
        })),
      },
    };

    const result = await fetchAllContent(ctx);

    expect(result).toEqual([]);
  });

  it("handles undefined nextCursor", async () => {
    const ctx = {
      content: {
        list: vi.fn(async () => ({
          items: [{ id: "1", data: { title: "Only" } }],
        })),
      },
    };

    const result = await fetchAllContent(ctx);

    expect(result).toHaveLength(1);
    expect(ctx.content.list).toHaveBeenCalledTimes(1);
  });
});
