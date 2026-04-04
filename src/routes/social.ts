import { z } from "zod";
import { postToTwitter } from "../utils/social/twitter.js";
import { postToBluesky } from "../utils/social/bluesky.js";
import { checkLicenseStatus, isFeatureAllowed } from "../utils/license.js";

const PostInput = z.object({
  contentId: z.string(),
  platforms: z.array(z.enum(["twitter", "bluesky"])),
});

const HistoryInput = z.object({
  contentId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const socialRoutes = {
  "social/post": {
    input: PostInput,
    handler: async (ctx: any) => {
      const license = await checkLicenseStatus(ctx);
      if (!isFeatureAllowed("social-auto-post", license.tier)) {
        return { error: "pro_required", message: "Social posting requires a Pro license" };
      }

      const { contentId, platforms } = ctx.input;
      const content = await ctx.content.get(contentId);
      if (!content) {
        return { error: "not_found", message: "Content not found" };
      }

      const [template, twitterKey, twitterSecret, bskyHandle, bskyPassword] =
        await Promise.all([
          ctx.kv.get("settings:socialPostTemplate"),
          ctx.kv.get("settings:twitterApiKey"),
          ctx.kv.get("settings:twitterApiSecret"),
          ctx.kv.get("settings:blueskyHandle"),
          ctx.kv.get("settings:blueskyAppPassword"),
        ]);

      const postTemplate = template ?? "New: {title} \u2014 {url}";
      const contentData = {
        title: content.title,
        url: `${ctx.site.url}/${content.collection}/${content.slug ?? contentId}`,
        description: content.description,
      };

      const results = await Promise.all(platforms.map(async (platform: string) => {
        const existing = await ctx.storage.socialPosts.query({
          where: { contentId, platform },
          limit: 1,
        });
        if (existing.items.length > 0) {
          return { platform, skipped: true, reason: "Already posted" };
        }

        let result;
        if (platform === "twitter" && twitterKey && twitterSecret) {
          result = await postToTwitter(
            ctx.http, { apiKey: twitterKey, apiSecret: twitterSecret },
            contentData, postTemplate,
          );
        } else if (platform === "bluesky" && bskyHandle && bskyPassword) {
          result = await postToBluesky(
            ctx.http, { handle: bskyHandle, appPassword: bskyPassword },
            contentData, postTemplate,
          );
        } else {
          return { platform, skipped: true, reason: "Not configured" };
        }

        if (result.success) {
          await ctx.storage.socialPosts.put(`${contentId}-${platform}`, {
            contentId,
            platform,
            postId: result.postId,
            postedAt: new Date().toISOString(),
          });
        }
        return result;
      }));

      return { results };
    },
  },

  "social/history": {
    input: HistoryInput,
    handler: async (ctx: any) => {
      const { contentId, cursor, limit } = ctx.input;
      const query: Record<string, unknown> = {
        orderBy: { postedAt: "desc" },
        limit: limit ?? 50,
      };
      if (contentId) {
        query.where = { contentId };
      }
      if (cursor) {
        query.cursor = cursor;
      }
      return ctx.storage.socialPosts.query(query);
    },
  },
};
