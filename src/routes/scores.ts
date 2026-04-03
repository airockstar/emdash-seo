import { z } from "zod";

const ListInput = z.object({
  collection: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const scoresRoutes = {
  "scores/list": {
    input: ListInput,
    handler: async (ctx: any) => {
      const { collection, cursor, limit } = ctx.input;
      const query: Record<string, unknown> = {
        orderBy: { score: "desc" },
        limit: limit ?? 50,
      };
      if (collection) {
        query.where = { collection };
      }
      if (cursor) {
        query.cursor = cursor;
      }
      return ctx.storage.scores.query(query);
    },
  },
};
