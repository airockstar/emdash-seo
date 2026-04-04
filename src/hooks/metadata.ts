import type { SeoOverrides, PublicPageContext, SeoDefaults } from "../types.js";
import { DEFAULT_TITLE_TEMPLATE, DEFAULT_SEPARATOR, DEFAULT_ROBOTS } from "../constants.js";
import { resolveSeoData } from "../utils/fallback-chain.js";
import { getSeoDefaults, getVerificationSettings } from "../utils/kv-settings.js";
import {
  buildArticleSchema,
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "../schemas/jsonld.js";
import { buildSchemaByType } from "../schemas/structured/index.js";

interface MetadataCtx {
  kv: {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown): Promise<void>;
  };
  storage: {
    overrides: {
      get(id: string): Promise<SeoOverrides | null>;
    };
  };
  users?: {
    get(id: string): Promise<{ name: string; email?: string; avatar?: string } | null>;
  };
  site: { url: string };
}

interface MetadataContribution {
  kind: "meta" | "property" | "link" | "jsonld";
  [key: string]: unknown;
}

export async function metadataHandler(
  event: { page: PublicPageContext },
  ctx: MetadataCtx,
): Promise<MetadataContribution[]> {
  const { page } = event;

  const [seoSettings, verificationSettings, overrides] = await Promise.all([
    getSeoDefaults(ctx.kv),
    getVerificationSettings(ctx.kv),
    page.content
      ? ctx.storage.overrides.get(page.content.id)
      : Promise.resolve(null),
  ]);

  const defaults: SeoDefaults = {
    siteName: seoSettings.siteName || "",
    titleTemplate: seoSettings.titleTemplate || DEFAULT_TITLE_TEMPLATE,
    titleSeparator: seoSettings.titleSeparator || DEFAULT_SEPARATOR,
    defaultOgImage: seoSettings.defaultOgImage || "",
    twitterHandle: seoSettings.twitterHandle || "",
    orgName: seoSettings.orgName || "",
    orgLogoUrl: seoSettings.orgLogoUrl || "",
    defaultRobots: seoSettings.defaultRobots || DEFAULT_ROBOTS,
  };

  const { googleVerification: googleV, bingVerification: bingV, pinterestVerification: pinterestV, yandexVerification: yandexV } = verificationSettings;

  const resolved = resolveSeoData(overrides, page, defaults);
  const contributions: MetadataContribution[] = [];

  if (resolved.description) {
    contributions.push({
      kind: "meta",
      name: "description",
      content: resolved.description,
    });
  }

  if (resolved.robots) {
    contributions.push({
      kind: "meta",
      name: "robots",
      content: resolved.robots,
    });
  }

  if (resolved.canonical) {
    contributions.push({
      kind: "link",
      rel: "canonical",
      href: resolved.canonical,
    });
  }

  contributions.push({
    kind: "property",
    property: "og:title",
    content: resolved.formattedTitle,
  });
  if (resolved.description) {
    contributions.push({
      kind: "property",
      property: "og:description",
      content: resolved.description,
    });
  }
  if (resolved.ogImage) {
    contributions.push({
      kind: "property",
      property: "og:image",
      content: resolved.ogImage,
    });
  }
  contributions.push({
    kind: "property",
    property: "og:url",
    content: page.url,
  });
  contributions.push({
    kind: "property",
    property: "og:type",
    content: page.kind === "content" ? "article" : "website",
  });
  if (defaults.siteName) {
    contributions.push({
      kind: "property",
      property: "og:site_name",
      content: defaults.siteName,
    });
  }
  if (page.locale) {
    contributions.push({
      kind: "property",
      property: "og:locale",
      content: page.locale,
    });
  }

  if (page.kind === "content" && page.articleMeta) {
    if (page.articleMeta.publishedTime) {
      contributions.push({
        kind: "property",
        property: "article:published_time",
        content: page.articleMeta.publishedTime,
      });
    }
    if (page.articleMeta.modifiedTime) {
      contributions.push({
        kind: "property",
        property: "article:modified_time",
        content: page.articleMeta.modifiedTime,
      });
    }
    if (page.articleMeta.author) {
      contributions.push({
        kind: "property",
        property: "article:author",
        content: page.articleMeta.author,
      });
    }
  }

  contributions.push({
    kind: "meta",
    name: "twitter:card",
    content: resolved.ogImage ? "summary_large_image" : "summary",
  });
  contributions.push({
    kind: "meta",
    name: "twitter:title",
    content: resolved.formattedTitle,
  });
  if (resolved.description) {
    contributions.push({
      kind: "meta",
      name: "twitter:description",
      content: resolved.description,
    });
  }
  if (resolved.ogImage) {
    contributions.push({
      kind: "meta",
      name: "twitter:image",
      content: resolved.ogImage,
    });
  }
  if (defaults.twitterHandle) {
    const handle = defaults.twitterHandle.startsWith("@")
      ? defaults.twitterHandle
      : `@${defaults.twitterHandle}`;
    contributions.push({ kind: "meta", name: "twitter:site", content: handle });
    contributions.push({
      kind: "meta",
      name: "twitter:creator",
      content: handle,
    });
  }

  if (page.kind === "content" && page.articleMeta) {
    // Enrich author with user data if available
    let author: string | { name: string; url?: string; image?: string } | undefined = page.articleMeta.author;
    if (page.articleMeta.author && ctx.users) {
      try {
        const user = await ctx.users.get(page.articleMeta.author);
        if (user) {
          author = { name: user.name, image: user.avatar };
        }
      } catch { /* graceful fallback to string author */ }
    }

    contributions.push({
      kind: "jsonld",
      graph: buildArticleSchema({
        headline: resolved.title,
        description: resolved.description,
        image: resolved.ogImage,
        datePublished: page.articleMeta.publishedTime,
        dateModified: page.articleMeta.modifiedTime,
        author,
        publisherName: defaults.orgName || defaults.siteName || undefined,
        publisherLogo: defaults.orgLogoUrl || undefined,
        url: page.url,
      }),
    });
  } else {
    contributions.push({
      kind: "jsonld",
      graph: buildWebPageSchema({
        name: resolved.formattedTitle,
        description: resolved.description,
        url: page.url,
      }),
    });
  }

  contributions.push({
    kind: "jsonld",
    graph: buildBreadcrumbSchema(page.url, defaults.siteName),
  });

  if (defaults.orgName) {
    contributions.push({
      kind: "jsonld",
      graph: buildOrganizationSchema({
        name: defaults.orgName,
        url: ctx.site.url,
        logo: defaults.orgLogoUrl || undefined,
      }),
    });
  }

  if (page.path === "/") {
    contributions.push({
      kind: "jsonld",
      graph: buildWebSiteSchema({
        name: defaults.siteName || defaults.orgName || "",
        url: ctx.site.url,
      }),
    });
  }

  // Custom structured data schema (FAQ, HowTo, Product, etc.) from overrides
  if (overrides?.schemaType && overrides.schemaData) {
    const customSchema = buildSchemaByType(overrides.schemaType, overrides.schemaData);
    if (customSchema) {
      contributions.push({ kind: "jsonld", graph: customSchema });
    }
  }

  // Verification meta tags (proper page:metadata contributions, not fragments)
  const VERIFICATION_PATTERN = /^[a-zA-Z0-9_-]+$/;
  const verifications: Array<[string, string | null]> = [
    ["google-site-verification", googleV],
    ["msvalidate.01", bingV],
    ["p:domain_verify", pinterestV],
    ["yandex-verification", yandexV],
  ];
  for (const [name, value] of verifications) {
    if (value && VERIFICATION_PATTERN.test(value)) {
      contributions.push({ kind: "meta", name, content: value });
    }
  }

  return contributions;
}
