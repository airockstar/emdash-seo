import { buildSitemapXml, type SitemapEntry } from "../schemas/sitemap-xml.js";
import { fetchAllContent } from "../utils/content.js";

interface SitemapCtx {
  kv: { get<T>(key: string): Promise<T | null> };
  storage: {
    overrides: {
      getMany(ids: string[]): Promise<Map<string, { robots?: string }>>;
    };
  };
  content: {
    list(opts?: { cursor?: string }): Promise<{ items: Array<{ id: string; data: Record<string, unknown> }>; nextCursor?: string }>;
  };
  site: { url: string };
}

export const sitemapRoutes = {
  "sitemap-xml": {
    public: true,
    handler: async (ctx: SitemapCtx) => {
      const [sitemapEnabled, sitemapExclude, defaultChangefreq, defaultPriority] =
        await Promise.all([
          ctx.kv.get<boolean>("settings:sitemapEnabled"),
          ctx.kv.get<string>("settings:sitemapExclude"),
          ctx.kv.get<string>("settings:sitemapDefaultChangefreq"),
          ctx.kv.get<number>("settings:sitemapDefaultPriority"),
        ]);

      if (sitemapEnabled === false) {
        return { error: "disabled", message: "Sitemap is disabled" };
      }

      const excludedCollections = new Set(
        (sitemapExclude ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );

      const items = await fetchAllContent(ctx);

      const candidates = items.filter(
        (item) => !excludedCollections.has(item.data.collection as string),
      );
      const overridesMap = await ctx.storage.overrides.getMany(
        candidates.map((item) => item.id),
      );

      const priority = defaultPriority ?? 0.5;
      const changefreq = (defaultChangefreq as SitemapEntry["changefreq"]) ?? "weekly";
      const entries: SitemapEntry[] = [];

      for (const item of candidates) {
        const overrides = overridesMap.get(item.id);
        if (overrides?.robots?.includes("noindex")) continue;

        const slug = (item.data.slug as string) || item.id;
        entries.push({
          loc: `${ctx.site.url}/${item.data.collection}/${slug}`,
          lastmod: item.data.updatedAt as string | undefined,
          changefreq,
          priority,
        });
      }

      return { xml: buildSitemapXml(entries), contentType: "application/xml" };
    },
  },
};
