import { extractHeadings, extractImages } from "../utils/portable-text.js";
import { checkTitleLength, checkTitleKeyword } from "../analysis/title.js";
import { checkDescriptionLength, checkDescriptionKeyword } from "../analysis/description.js";
import { checkSingleH1, checkHeadingHierarchy } from "../analysis/headings.js";
import { checkImageAltText } from "../analysis/images.js";
import { calculateScore } from "../analysis/score.js";

export const contentAfterSaveHook = async (event: any, ctx: any) => {
  const { content, collection } = event;

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
};
