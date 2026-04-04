import { z } from "zod";
import { checkLicenseStatus, isFeatureAllowed } from "../utils/license.js";

const SaveSchema = z.object({
  contentId: z.string(),
  collection: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  robots: z.string().optional(),
  canonical: z.string().optional(),
  focusKeyword: z.string().optional(),
  schemaType: z.enum(["faq", "howto", "product", "localBusiness", "event"]).optional(),
  schemaData: z.record(z.string(), z.unknown()).optional(),
});

const GetSchema = z.object({ contentId: z.string() });

const ListSchema = z.object({
  collection: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

const DeleteSchema = z.object({ contentId: z.string() });

const BulkSaveSchema = z.object({
  items: z.array(
    z.object({
      contentId: z.string(),
      collection: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      ogImage: z.string().optional(),
      robots: z.string().optional(),
      canonical: z.string().optional(),
      focusKeyword: z.string().optional(),
      schemaType: z.enum(["faq", "howto", "product", "localBusiness", "event"]).optional(),
      schemaData: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});

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

  "overrides/bulk-save": {
    input: BulkSaveSchema,
    handler: async (ctx: any) => {
      const license = await checkLicenseStatus(ctx);
      if (!isFeatureAllowed("bulk-editing", license.tier)) {
        return { error: "pro_required", message: "Bulk editing requires a Pro license" };
      }

      const { items } = ctx.input;
      const entries = items.map((item: any) => {
        const { contentId, ...seoData } = item;
        return { id: contentId, data: { contentId, ...seoData } };
      });
      await ctx.storage.overrides.putMany(entries);
      return { success: true, count: items.length };
    },
  },
};
