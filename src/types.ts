export interface SeoOverrides {
  contentId: string;
  collection?: string;
  title?: string;
  description?: string;
  ogImage?: string;
  robots?: string;
  canonical?: string;
  focusKeyword?: string;
}

export interface ResolvedSeoData {
  title: string | undefined;
  description: string | undefined;
  ogImage: string | undefined;
  robots: string | undefined;
  canonical: string | undefined;
  formattedTitle: string;
}

export interface SeoCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  message: string;
  weight: number;
}

export interface SeoScore {
  contentId: string;
  collection: string;
  score: number;
  checks: SeoCheck[];
  analyzedAt: string;
}

export interface PublicPageContext {
  url: string;
  path: string;
  locale: string;
  kind: "content" | "custom";
  pageType: string;
  title: string;
  description: string;
  canonical: string;
  image: string;
  content?: { collection: string; id: string; slug: string };
  seo?: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    robots: string;
  };
  articleMeta?: {
    publishedTime: string;
    modifiedTime: string;
    author: string;
  };
  siteName?: string;
}

export interface SeoDefaults {
  siteName: string;
  titleTemplate: string;
  titleSeparator: string;
  defaultOgImage: string;
  twitterHandle: string;
  orgName: string;
  orgLogoUrl: string;
  defaultRobots: string;
}
