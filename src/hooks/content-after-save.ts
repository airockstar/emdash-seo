import { extractHeadings, extractImages } from "../utils/portable-text.js";
import { checkTitleLength, checkTitleKeyword } from "../analysis/title.js";
import { checkDescriptionLength, checkDescriptionKeyword } from "../analysis/description.js";
import { checkSingleH1, checkHeadingHierarchy } from "../analysis/headings.js";
import { checkImageAltText } from "../analysis/images.js";
import { calculateScore } from "../analysis/score.js";
import { postToTwitter } from "../utils/social/twitter.js";
import { postToBluesky } from "../utils/social/bluesky.js";

export const contentAfterSaveHook = async (event: any, ctx: any) => {
  const { content, collection, isNew } = event;

  // Auto-analyze
  const overrides = await ctx.storage.overrides.get(content.id);
  const title = overrides?.title ?? content.title;
  const description = overrides?.description ?? content.description;
  const keyword = overrides?.focusKeyword;
  const blocks = content.body ?? [];

  const headings = extractHeadings(blocks);
  const images = extractImages(blocks);

  const checks = [
    checkTitleLength(title),
    checkTitleKeyword(title, keyword),
    checkDescriptionLength(description),
    checkDescriptionKeyword(description, keyword),
    checkSingleH1(headings),
    checkHeadingHierarchy(headings),
    checkImageAltText(images),
  ];

  const score = calculateScore(checks);

  await ctx.storage.scores.put(content.id, {
    contentId: content.id,
    collection,
    score,
    checks,
    analyzedAt: new Date().toISOString(),
  });

  // Auto-post on new published content
  if (!isNew || content.status !== "published") return;

  const autoPost = await ctx.kv.get("settings:enableAutoPost");
  if (!autoPost) return;

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
    url: `${ctx.site.url}/${collection}/${content.slug ?? content.id}`,
    description: content.description,
  };

  const platforms: Array<{ name: string; post: () => Promise<any> }> = [];

  if (twitterKey && twitterSecret) {
    platforms.push({
      name: "twitter",
      post: () => postToTwitter(ctx.http, { apiKey: twitterKey, apiSecret: twitterSecret }, contentData, postTemplate),
    });
  }
  if (bskyHandle && bskyPassword) {
    platforms.push({
      name: "bluesky",
      post: () => postToBluesky(ctx.http, { handle: bskyHandle, appPassword: bskyPassword }, contentData, postTemplate),
    });
  }

  await Promise.allSettled(platforms.map(async ({ name, post }) => {
    const existing = await ctx.storage.socialPosts.query({
      where: { contentId: content.id, platform: name },
      limit: 1,
    });
    if (existing.items.length > 0) return;

    const result = await post();
    if (result.success) {
      await ctx.storage.socialPosts.put(`${content.id}-${name}`, {
        contentId: content.id,
        platform: name,
        postId: result.postId,
        postedAt: new Date().toISOString(),
      });
    } else {
      ctx.log.warn(`Auto-post to ${name} failed: ${result.error}`);
    }
  }));
};
