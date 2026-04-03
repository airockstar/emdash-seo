import { buildRobotsTxt } from "../schemas/robots-txt.js";

interface RobotsCtx {
  kv: { get<T>(key: string): Promise<T | null> };
  site: { url: string };
}

export const robotsRoutes = {
  "robots-txt": {
    public: true,
    handler: async (ctx: RobotsCtx) => {
      const [customRules, crawlDelay, sitemapEnabled] = await Promise.all([
        ctx.kv.get<string>("settings:robotsTxtCustom"),
        ctx.kv.get<number>("settings:robotsCrawlDelay"),
        ctx.kv.get<boolean>("settings:sitemapEnabled"),
      ]);

      const txt = buildRobotsTxt({
        customRules: customRules ?? undefined,
        crawlDelay: crawlDelay ?? undefined,
        sitemapUrl: sitemapEnabled !== false ? `${ctx.site.url}/sitemap.xml` : undefined,
      });

      return { text: txt, contentType: "text/plain" };
    },
  },
};
