import { buildSitemapXml, type SitemapEntry } from "../schemas/sitemap-xml.js";

interface ContentItem {
  id: string;
  data: {
    collection: string;
    slug: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
}

interface SitemapCtx {
  kv: { get<T>(key: string): Promise<T | null> };
  storage: {
    overrides: {
      getMany(ids: string[]): Promise<Map<string, { robots?: string }>>;
    };
  };
  content: {
    list(opts?: { cursor?: string }): Promise<{ items: ContentItem[]; nextCursor?: string }>;
  };
  site: { url: string };
}

async function fetchAllContent(ctx: SitemapCtx): Promise<ContentItem[]> {
  const all: ContentItem[] = [];
  let cursor: string | undefined;

  do {
    const result = await ctx.content.list(cursor ? { cursor } : undefined);
    all.push(...result.items);
    cursor = result.nextCursor;
  } while (cursor);

  return all;
}

export const sitemapRoutes = {
  "sitemap.xml": {
    public: true,
    handler: async (ctx: SitemapCtx) => {
      const [sitemapEnabled, sitemapExclude, defaultChangefreq, defaultPriority] =
        await Promise.all([
          ctx.kv.get<boolean>("settings:sitemapEnabled"),
          ctx.kv.get<string>("settings:sitemapExclude"),
          ctx.kv.get<string>("settings:sitemapDefaultChangefreq"),
          ctx.kv.get<string>("settings:sitemapDefaultPriority"),
        ]);

      if (sitemapEnabled === false) {
        return new Response("Sitemap disabled", { status: 404 });
      }

      const excludedCollections = new Set(
        (sitemapExclude ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );

      const items = await fetchAllContent(ctx);

      const candidates = items.filter(
        (item) => !excludedCollections.has(item.data.collection),
      );
      const overridesMap = await ctx.storage.overrides.getMany(
        candidates.map((item) => item.id),
      );

      const priority = parseFloat(defaultPriority ?? "0.5");
      const changefreq = (defaultChangefreq as SitemapEntry["changefreq"]) ?? "weekly";
      const entries: SitemapEntry[] = [];

      for (const item of candidates) {
        const overrides = overridesMap.get(item.id);
        if (overrides?.robots?.includes("noindex")) continue;

        const slug = item.data.slug || item.id;
        entries.push({
          loc: `${ctx.site.url}/${item.data.collection}/${slug}`,
          lastmod: item.data.updatedAt,
          changefreq,
          priority,
        });
      }

      const xml = buildSitemapXml(entries);
      return new Response(xml, {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      });
    },
  },
};
