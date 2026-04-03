import { extractHeadings, extractImages } from "../utils/portable-text.js";
import { checkTitleLength, checkTitleKeyword } from "../analysis/title.js";
import { checkDescriptionLength, checkDescriptionKeyword } from "../analysis/description.js";
import { checkSingleH1, checkHeadingHierarchy } from "../analysis/headings.js";
import { checkImageAltText } from "../analysis/images.js";
import { calculateScore } from "../analysis/score.js";

export const cronHook = async (event: any, ctx: any) => {
  if (event.name !== "recalculate-scores") return;

  const all: any[] = [];
  let cursor: string | undefined;

  do {
    const result = await ctx.content.list(cursor ? { cursor } : undefined);
    all.push(...result.items);
    cursor = result.nextCursor;
  } while (cursor);

  for (const item of all) {
    const content = item.data ?? item;
    const overrides = await ctx.storage.overrides.get(item.id);
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

    await ctx.storage.scores.put(item.id, {
      contentId: item.id,
      collection: content.collection ?? "",
      score,
      checks,
      analyzedAt: new Date().toISOString(),
    });
  }
};
