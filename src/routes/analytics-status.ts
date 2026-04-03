interface ContentItem {
  id: string;
  data: {
    title?: string;
    description?: string;
    image?: string;
    [key: string]: unknown;
  };
}

interface StatusCtx {
  content: {
    list(opts?: { cursor?: string }): Promise<{ items: ContentItem[]; nextCursor?: string }>;
  };
  storage: {
    overrides: {
      getMany(ids: string[]): Promise<Map<string, { title?: string; description?: string; ogImage?: string }>>;
    };
  };
}

async function fetchAllContent(ctx: StatusCtx): Promise<ContentItem[]> {
  const all: ContentItem[] = [];
  let cursor: string | undefined;

  do {
    const result = await ctx.content.list(cursor ? { cursor } : undefined);
    all.push(...result.items);
    cursor = result.nextCursor;
  } while (cursor);

  return all;
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

        const title = overrides?.title ?? item.data.title;
        const description = overrides?.description ?? item.data.description;
        const ogImage = overrides?.ogImage ?? item.data.image;

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
