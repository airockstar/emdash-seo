export const SETTINGS_SCHEMA = {
  siteName: { type: "string" as const, label: "Site Name", default: "" },
  titleTemplate: {
    type: "string" as const,
    label: "Title Template",
    default: "{title} | {site}",
  },
  titleSeparator: {
    type: "select" as const,
    label: "Title Separator",
    options: [
      { value: "|", label: "|" },
      { value: "-", label: "-" },
      { value: "\u2014", label: "\u2014" },
      { value: "\u00B7", label: "\u00B7" },
    ],
    default: "|",
  },
  defaultOgImage: { type: "string" as const, label: "Default OG Image URL", default: "" },
  twitterHandle: { type: "string" as const, label: "Twitter @handle", default: "" },
  orgName: { type: "string" as const, label: "Organization Name", default: "" },
  orgLogoUrl: { type: "string" as const, label: "Organization Logo URL", default: "" },
  defaultRobots: {
    type: "string" as const,
    label: "Default Robots Directive",
    default: "index, follow",
  },
  googleAnalyticsId: {
    type: "string" as const,
    label: "Google Analytics ID (e.g. G-XXXXXXX)",
    default: "",
  },
  googleVerification: {
    type: "string" as const,
    label: "Google Site Verification Code",
    default: "",
  },

  // Phase 2: Sitemap & Indexing
  sitemapEnabled: { type: "boolean" as const, label: "Enable XML Sitemap", default: true },
  sitemapExclude: {
    type: "string" as const,
    label: "Exclude Collections (comma-separated)",
    default: "",
  },
  sitemapDefaultChangefreq: {
    type: "select" as const,
    label: "Default Change Frequency",
    options: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ],
    default: "weekly",
  },
  sitemapDefaultPriority: { type: "string" as const, label: "Default Priority (0.0-1.0)", default: "0.5" },
  robotsTxtCustom: { type: "string" as const, label: "Custom robots.txt Rules", default: "", multiline: true },
  robotsCrawlDelay: { type: "number" as const, label: "Crawl Delay (seconds)", default: 0, min: 0, max: 60 },
  bingVerification: { type: "string" as const, label: "Bing Verification Code", default: "" },
  pinterestVerification: { type: "string" as const, label: "Pinterest Verification Code", default: "" },
  yandexVerification: { type: "string" as const, label: "Yandex Verification Code", default: "" },
};
