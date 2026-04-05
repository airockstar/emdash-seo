import { z } from "zod";

const SaveSchema = z.object({
  id: z.string().optional(),
  from: z.string(),
  to: z.string(),
  status: z.number(),
});

const DeleteSchema = z.object({ id: z.string() });

const ListSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const redirectRoutes = {
  "redirects/list": {
    input: ListSchema,
    handler: async (ctx: any) => {
      const { cursor, limit } = ctx.input;
      const query: Record<string, unknown> = {
        orderBy: { createdAt: "desc" },
        limit: limit ?? 50,
      };
      if (cursor) query.cursor = cursor;
      return ctx.storage.redirects.query(query);
    },
  },

  "redirects/save": {
    input: SaveSchema,
    handler: async (ctx: any) => {
      const { id, from, to, status } = ctx.input;
      const redirectId = id || `redirect-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const existing = id ? await ctx.storage.redirects.get(id) : null;
      const createdAt = existing?.createdAt ?? new Date().toISOString();
      await ctx.storage.redirects.put(redirectId, {
        from,
        to,
        status,
        createdAt,
      });
      return { success: true, id: redirectId };
    },
  },

  "redirects/delete": {
    input: DeleteSchema,
    handler: async (ctx: any) => {
      const deleted = await ctx.storage.redirects.delete(ctx.input.id);
      return { success: true, deleted };
    },
  },
};
