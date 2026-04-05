import { z } from "zod";
import { buildSitemapXml, buildSitemapIndexXml, type SitemapEntry } from "../schemas/sitemap-xml.js";
import { buildNewsSitemapXml, type NewsSitemapEntry } from "../schemas/sitemap-news.js";
import { buildVideoSitemapXml, type VideoSitemapEntry } from "../schemas/sitemap-video.js";
import { buildImageSitemapXml, type ImageSitemapEntry } from "../schemas/sitemap-image.js";
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

async function loadSitemapSettings(ctx: SitemapCtx) {
  const [sitemapEnabled, sitemapExclude, defaultChangefreq, defaultPriority] =
    await Promise.all([
      ctx.kv.get("settings:sitemapEnabled"),
      ctx.kv.get<string>("settings:sitemapExclude"),
      ctx.kv.get<string>("settings:sitemapDefaultChangefreq"),
      ctx.kv.get<number>("settings:sitemapDefaultPriority"),
    ]);

  return {
    enabled: sitemapEnabled !== false,
    excludedCollections: new Set(
      (sitemapExclude ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    ),
    changefreq: (defaultChangefreq as SitemapEntry["changefreq"]) ?? "weekly",
    priority: defaultPriority ?? 0.5,
  };
}

async function buildEntries(
  items: Array<{ id: string; data: Record<string, unknown> }>,
  ctx: SitemapCtx,
  changefreq: SitemapEntry["changefreq"],
  priority: number,
): Promise<SitemapEntry[]> {
  const overridesMap = await ctx.storage.overrides.getMany(items.map((item) => item.id));
  const entries: SitemapEntry[] = [];

  for (const item of items) {
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

  return entries;
}

export const sitemapRoutes = {
  // Sitemap index — lists per-collection sitemaps
  "sitemap-xml": {
    public: true,
    handler: async (ctx: SitemapCtx) => {
      const settings = await loadSitemapSettings(ctx);
      if (!settings.enabled) {
        return { error: "disabled", message: "Sitemap is disabled" };
      }

      const items = await fetchAllContent(ctx);

      // Discover collections
      const collections = new Set<string>();
      for (const item of items) {
        const col = item.data.collection as string;
        if (col && !settings.excludedCollections.has(col)) {
          collections.add(col);
        }
      }

      if (collections.size <= 1) {
        // Single collection or empty — return flat sitemap
        const candidates = items.filter(
          (item) => !settings.excludedCollections.has(item.data.collection as string),
        );
        const entries = await buildEntries(candidates, ctx, settings.changefreq, settings.priority);
        return { xml: buildSitemapXml(entries), contentType: "application/xml" };
      }

      // Multiple collections — return sitemap index
      const sitemaps = [...collections].map((col) => ({
        loc: `${ctx.site.url}/_plugins/@emdash-seo/toolkit/sitemap-collection?collection=${encodeURIComponent(col)}`,
      }));

      return { xml: buildSitemapIndexXml(sitemaps), contentType: "application/xml" };
    },
  },

  // Per-collection sitemap
  "sitemap-collection": {
    public: true,
    input: z.object({ collection: z.string() }),
    handler: async (ctx: any) => {
      const settings = await loadSitemapSettings(ctx);
      if (!settings.enabled) {
        return { error: "disabled", message: "Sitemap is disabled" };
      }

      const { collection } = ctx.input;
      if (settings.excludedCollections.has(collection)) {
        return { error: "excluded", message: `Collection "${collection}" is excluded from sitemap` };
      }

      const items = await fetchAllContent(ctx);
      const filtered = items.filter((item) => item.data.collection === collection);
      const entries = await buildEntries(filtered, ctx, settings.changefreq, settings.priority);

      return { xml: buildSitemapXml(entries), contentType: "application/xml" };
    },
  },

  "sitemap-news": {
    public: true,
    handler: async (ctx: any) => {
      const enabled = await ctx.kv.get("settings:newsSitemapEnabled");
      if (!enabled) {
        return { error: "disabled", message: "News sitemap is disabled" };
      }

      const items = await fetchAllContent(ctx);
      const entries: NewsSitemapEntry[] = [];

      for (const item of items) {
        const publishedAt = item.data.publishedAt as string | undefined;
        if (!publishedAt) continue;

        const slug = (item.data.slug as string) || item.id;
        const collection = item.data.collection as string | undefined;
        entries.push({
          loc: collection ? `${ctx.site.url}/${collection}/${slug}` : `${ctx.site.url}/${slug}`,
          publicationName: ctx.site.name ?? "",
          language: ctx.site.locale ?? "en",
          publicationDate: publishedAt,
          title: (item.data.title as string) ?? "",
        });
      }

      return { xml: buildNewsSitemapXml(entries), contentType: "application/xml" };
    },
  },

  "sitemap-video": {
    public: true,
    handler: async (ctx: any) => {
      const enabled = await ctx.kv.get("settings:videoSitemapEnabled");
      if (!enabled) {
        return { error: "disabled", message: "Video sitemap is disabled" };
      }

      const items = await fetchAllContent(ctx);
      const entries: VideoSitemapEntry[] = [];

      for (const item of items) {
        const videoUrl = item.data.videoUrl as string | undefined;
        if (!videoUrl) continue;

        const slug = (item.data.slug as string) || item.id;
        const collection = item.data.collection as string | undefined;
        entries.push({
          loc: collection ? `${ctx.site.url}/${collection}/${slug}` : `${ctx.site.url}/${slug}`,
          thumbnailUrl: (item.data.videoThumbnail as string) ?? (item.data.image as string) ?? "",
          title: (item.data.title as string) ?? "",
          description: (item.data.description as string) ?? "",
          contentUrl: videoUrl,
          duration: item.data.videoDuration as number | undefined,
        });
      }

      return { xml: buildVideoSitemapXml(entries), contentType: "application/xml" };
    },
  },

  "sitemap-image": {
    public: true,
    handler: async (ctx: any) => {
      const enabled = await ctx.kv.get("settings:imageSitemapEnabled");
      if (!enabled) {
        return { error: "disabled", message: "Image sitemap is disabled" };
      }

      const items = await fetchAllContent(ctx);
      const entries: ImageSitemapEntry[] = [];

      for (const item of items) {
        const image = item.data.image as string | undefined;
        if (!image) continue;

        const slug = (item.data.slug as string) || item.id;
        const collection = item.data.collection as string | undefined;

        const images: Array<{ url: string; title?: string; caption?: string }> = [
          { url: image, title: (item.data.title as string) ?? undefined },
        ];

        entries.push({
          loc: collection ? `${ctx.site.url}/${collection}/${slug}` : `${ctx.site.url}/${slug}`,
          images,
        });
      }

      return { xml: buildImageSitemapXml(entries), contentType: "application/xml" };
    },
  },
};
