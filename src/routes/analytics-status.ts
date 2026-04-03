import { fetchAllContent } from "../utils/content.js";

interface StatusCtx {
  content: {
    list(opts?: { cursor?: string }): Promise<{
      items: Array<{ id: string; data: Record<string, unknown> }>;
      nextCursor?: string;
    }>;
  };
  storage: {
    overrides: {
      getMany(ids: string[]): Promise<Map<string, { title?: string; description?: string; ogImage?: string }>>;
    };
  };
}

export const analyticsStatusRoutes = {
  "analytics/status": {
    handler: async (ctx: StatusCtx) => {
      const items = await fetchAllContent(ctx);
      const overridesMap = await ctx.storage.overrides.getMany(
        items.map((item) => item.id),
      );

      let missingTitle = 0;
      let missingDescription = 0;
      let missingOgImage = 0;
      let withOverrides = 0;

      for (const item of items) {
        const overrides = overridesMap.get(item.id);
        if (overrides) withOverrides++;

        const title = overrides?.title ?? (item.data.title as string | undefined);
        const description = overrides?.description ?? (item.data.description as string | undefined);
        const ogImage = overrides?.ogImage ?? (item.data.image as string | undefined);

        if (!title) missingTitle++;
        if (!description) missingDescription++;
        if (!ogImage) missingOgImage++;
      }

      return {
        total: items.length,
        missingTitle,
        missingDescription,
        missingOgImage,
        withOverrides,
        withoutOverrides: items.length - withOverrides,
      };
    },
  },
};
