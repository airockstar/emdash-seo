import type { SeoOverrides, PublicPageContext, ResolvedSeoData } from "../types.js";
import { formatTitle } from "./title-template.js";

export function resolveSeoData(
  overrides: SeoOverrides | null,
  page: PublicPageContext,
  defaults: {
    siteName: string;
    titleTemplate: string;
    titleSeparator: string;
    defaultOgImage: string;
    defaultRobots: string;
  },
): ResolvedSeoData {
  const title =
    overrides?.title ?? page.seo?.ogTitle ?? page.title ?? undefined;
  const description =
    overrides?.description ??
    page.seo?.ogDescription ??
    page.description ??
    undefined;
  const ogImage =
    overrides?.ogImage ||
    page.seo?.ogImage ||
    page.image ||
    defaults.defaultOgImage ||
    undefined;
  const robots =
    overrides?.robots ??
    page.seo?.robots ??
    defaults.defaultRobots ??
    undefined;
  const canonical = overrides?.canonical ?? page.canonical ?? undefined;

  const formattedTitle = formatTitle(
    defaults.titleTemplate,
    title ?? "",
    defaults.siteName,
    defaults.titleSeparator,
  );

  return { title, description, ogImage, robots, canonical, formattedTitle };
}
