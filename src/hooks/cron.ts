import { extractHeadings, extractImages } from "../utils/portable-text.js";
import { fetchAllContent } from "../utils/content.js";
import { checkTitleLength, checkTitleKeyword } from "../analysis/title.js";
import { checkDescriptionLength, checkDescriptionKeyword } from "../analysis/description.js";
import { checkSingleH1, checkHeadingHierarchy } from "../analysis/headings.js";
import { checkImageAltText } from "../analysis/images.js";
import { calculateScore } from "../analysis/score.js";

export const cronHook = async (event: any, ctx: any) => {
  if (event.name !== "recalculate-scores") return;

  const items = await fetchAllContent(ctx);

  // Batch fetch all overrides
  const overridesMap = await ctx.storage.overrides.getMany(
    items.map((item: any) => item.id),
  );

  const scoresToWrite: Array<{ id: string; data: Record<string, unknown> }> = [];

  for (const item of items) {
    const content = item.data ?? item;
    const overrides = overridesMap.get(item.id);
    const title = overrides?.title ?? content.title;
    const description = overrides?.description ?? content.description;
    const keyword = overrides?.focusKeyword;
    const blocks = (content.body ?? []) as any[];

    const headings = extractHeadings(blocks as any);
    const images = extractImages(blocks as any);

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

    scoresToWrite.push({
      id: item.id,
      data: {
        contentId: item.id,
        collection: content.collection ?? "",
        score,
        checks,
        analyzedAt: new Date().toISOString(),
      },
    });
  }

  // Batch write all scores
  if (scoresToWrite.length > 0) {
    await ctx.storage.scores.putMany(scoresToWrite);
  }
};
