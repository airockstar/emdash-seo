import { z } from "zod";

const SaveSchema = z.object({
  contentId: z.string(),
  collection: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  robots: z.string().optional(),
  canonical: z.string().optional(),
  focusKeyword: z.string().optional(),
});

const GetSchema = z.object({ contentId: z.string() });

const ListSchema = z.object({
  collection: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

const DeleteSchema = z.object({ contentId: z.string() });

export const overrideRoutes = {
  "overrides/save": {
    input: SaveSchema,
    handler: async (ctx: any) => {
      const { contentId, ...seoData } = ctx.input;
      await ctx.storage.overrides.put(contentId, { contentId, ...seoData });
      return { success: true };
    },
  },

  "overrides/get": {
    input: GetSchema,
    handler: async (ctx: any) => {
      const data = await ctx.storage.overrides.get(ctx.input.contentId);
      return { overrides: data };
    },
  },

  "overrides/list": {
    input: ListSchema,
    handler: async (ctx: any) => {
      const { collection, cursor, limit } = ctx.input;
      const query: Record<string, unknown> = {
        orderBy: { collection: "asc" },
        limit: limit ?? 50,
      };
      if (collection) {
        query.where = { collection };
      }
      if (cursor) {
        query.cursor = cursor;
      }
      return ctx.storage.overrides.query(query);
    },
  },

  "overrides/delete": {
    input: DeleteSchema,
    handler: async (ctx: any) => {
      const deleted = await ctx.storage.overrides.delete(ctx.input.contentId);
      return { success: true, deleted };
    },
  },
};
