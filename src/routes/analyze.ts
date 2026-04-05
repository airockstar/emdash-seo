import { z } from "zod";
import { extractPlainText } from "emdash";
import type { SeoCheck, SeoOverrides } from "../types.js";
import { extractHeadings, extractImages, extractLinks } from "../utils/portable-text.js";
import { fetchAllContent } from "../utils/content.js";
import { checkTitleLength, checkTitleKeyword } from "../analysis/title.js";
import { checkDescriptionLength, checkDescriptionKeyword } from "../analysis/description.js";
import { checkSingleH1, checkHeadingHierarchy } from "../analysis/headings.js";
import { checkImageAltText } from "../analysis/images.js";
import { checkReadability, checkPassiveVoice, checkSentenceLength, checkTransitionWords, checkParagraphLength } from "../analysis/readability.js";
import { checkKeywordDensity, checkKeywordInFirstParagraph } from "../analysis/keywords.js";
import { checkOgImage } from "../analysis/og-image.js";
import { checkInternalLinks } from "../analysis/links.js";
import { checkOutboundLinks } from "../analysis/outbound-links.js";
import { checkDuplicateTitle, checkDuplicateDescription } from "../analysis/duplicates.js";
import { calculateScore } from "../analysis/score.js";
import { checkLicenseStatus, isFeatureAllowed } from "../utils/license.js";
import { suggestInternalLinks } from "../analysis/link-suggestions.js";
import { suggestAltText } from "../analysis/alt-suggestions.js";
import { findOrphanedContent } from "../analysis/orphaned-content.js";
import { checkBrokenLinks } from "../analysis/broken-links.js";

function runFreeChecks(
  title: string | undefined,
  description: string | undefined,
  keyword: string | undefined,
  blocks: unknown[],
  siteUrl?: string,
): SeoCheck[] {
  const headings = extractHeadings(blocks as any);
  const images = extractImages(blocks as any);
  const links = extractLinks(blocks as any, siteUrl);

  return [
    checkTitleLength(title),
    checkTitleKeyword(title, keyword),
    checkDescriptionLength(description),
    checkDescriptionKeyword(description, keyword),
    checkSingleH1(headings),
    checkHeadingHierarchy(headings),
    checkImageAltText(images),
    checkOutboundLinks(links),
  ];
}

function runPaidChecks(
  text: string,
  keyword: string | undefined,
  blocks: unknown[],
  title: string | undefined,
  description: string | undefined,
  allOverrides: Array<{ id: string; data: SeoOverrides }>,
  currentId: string,
  siteUrl: string,
): SeoCheck[] {
  const links = extractLinks(blocks as any, siteUrl);

  return [
    checkReadability(text),
    checkPassiveVoice(text),
    checkSentenceLength(text),
    checkTransitionWords(text),
    checkParagraphLength(text),
    checkKeywordDensity(text, keyword),
    checkKeywordInFirstParagraph(text, keyword),
    checkInternalLinks(links),
    checkDuplicateTitle(title, allOverrides, currentId),
    checkDuplicateDescription(description, allOverrides, currentId),
  ];
}

const AnalyzeInput = z.object({ contentId: z.string() });

export const analyzeRoutes = {
  analyze: {
    input: AnalyzeInput,
    handler: async (ctx: any) => {
      const content = await ctx.content.get(ctx.input.contentId);
      if (!content) {
        return { error: "not_found", message: "Content not found" };
      }

      const overrides = await ctx.storage.overrides.get(ctx.input.contentId);
      const title = overrides?.title ?? content.title;
      const description = overrides?.description ?? content.description;
      const keyword = overrides?.focusKeyword;
      const blocks = content.body ?? [];

      const ogImage = overrides?.ogImage ?? content.image;
      const checks = runFreeChecks(title, description, keyword, blocks, ctx.site.url);
      const ogCheck = await checkOgImage(ogImage, ctx.media);
      checks.push(ogCheck);
      const score = calculateScore(checks);

      await ctx.storage.scores.put(ctx.input.contentId, {
        contentId: ctx.input.contentId,
        collection: content.collection ?? "",
        score,
        checks,
        analyzedAt: new Date().toISOString(),
      });

      return { score, checks };
    },
  },

  "analyze/advanced": {
    input: AnalyzeInput,
    handler: async (ctx: any) => {
      const license = await checkLicenseStatus(ctx);
      if (!isFeatureAllowed("advanced-analysis", license.tier)) {
        return { error: "pro_required", message: "Advanced analysis requires a Pro license" };
      }

      const content = await ctx.content.get(ctx.input.contentId);
      if (!content) {
        return { error: "not_found", message: "Content not found" };
      }

      const [overrides, allOverridesResult] = await Promise.all([
        ctx.storage.overrides.get(ctx.input.contentId),
        ctx.storage.overrides.query({ limit: 1000 }),
      ]);

      const title = overrides?.title ?? content.title;
      const description = overrides?.description ?? content.description;
      const keyword = overrides?.focusKeyword;
      const blocks = content.body ?? [];
      const text = extractPlainText(blocks);

      const images = extractImages(blocks as any);

      const ogImage = overrides?.ogImage ?? content.image;
      const freeChecks = runFreeChecks(title, description, keyword, blocks, ctx.site.url);
      const ogCheck = await checkOgImage(ogImage, ctx.media);
      freeChecks.push(ogCheck);
      const paidChecks = runPaidChecks(
        text, keyword, blocks,
        title, description,
        allOverridesResult.items,
        ctx.input.contentId,
        ctx.site.url,
      );

      const checks = [...freeChecks, ...paidChecks];
      const score = calculateScore(checks);

      const altSuggestions = suggestAltText(images, title ?? "");

      await ctx.storage.scores.put(ctx.input.contentId, {
        contentId: ctx.input.contentId,
        collection: content.collection ?? "",
        score,
        checks,
        analyzedAt: new Date().toISOString(),
      });

      return { score, checks, altSuggestions };
    },
  },

  "analyze/link-suggestions": {
    input: AnalyzeInput,
    handler: async (ctx: any) => {
      const license = await checkLicenseStatus(ctx);
      if (!isFeatureAllowed("internal-link-suggestions", license.tier)) {
        return { error: "pro_required", message: "Internal link suggestions require a Pro license" };
      }

      const content = await ctx.content.get(ctx.input.contentId);
      if (!content) {
        return { error: "not_found", message: "Content not found" };
      }

      const blocks = content.body ?? [];
      const text = extractPlainText(blocks);

      const allItems = await fetchAllContent(ctx);
      const suggestions = suggestInternalLinks(
        text,
        ctx.input.contentId,
        allItems,
        ctx.site.url,
      );

      return { suggestions };
    },
  },

  "analyze/orphaned": {
    handler: async (ctx: any) => {
      const license = await checkLicenseStatus(ctx);
      if (!isFeatureAllowed("orphaned-content", license.tier)) {
        return { error: "pro_required", message: "Orphaned content detection requires a Pro license" };
      }

      const allItems = await fetchAllContent(ctx);

      // Gather all internal links from all content bodies
      const allLinks: Array<{ href: string; internal: boolean }> = [];
      for (const item of allItems) {
        const blocks = (item.data.body as unknown[]) ?? [];
        const links = extractLinks(blocks as any, ctx.site.url);
        allLinks.push(...links);
      }

      const orphaned = findOrphanedContent(allItems, allLinks, ctx.site.url);
      return { orphaned };
    },
  },

  "analyze/broken-links": {
    input: AnalyzeInput,
    handler: async (ctx: any) => {
      const license = await checkLicenseStatus(ctx);
      if (!isFeatureAllowed("broken-links", license.tier)) {
        return { error: "pro_required", message: "Broken link checking requires a Pro license" };
      }

      const content = await ctx.content.get(ctx.input.contentId);
      if (!content) {
        return { error: "not_found", message: "Content not found" };
      }

      const blocks = content.body ?? [];
      const links = extractLinks(blocks as any, ctx.site.url);

      // Only check internal links (safer — no unrestricted outbound fetch needed)
      const internalLinks = links.filter((l) => l.internal);
      const broken = await checkBrokenLinks(internalLinks, ctx.http, ctx.site.url);
      return { broken };
    },
  },
};
