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

  // Phase 3: Analytics & Tracking
  gtmContainerId: {
    type: "string" as const,
    label: "GTM Container ID (e.g. GTM-XXXXXXX)",
    default: "",
  },
  cfAnalyticsToken: { type: "string" as const, label: "Cloudflare Analytics Token", default: "" },
  facebookPixelId: { type: "string" as const, label: "Facebook Pixel ID", default: "" },
  customHeadScripts: {
    type: "string" as const,
    label: "Custom Scripts (head)",
    default: "",
    multiline: true,
  },
  customBodyScripts: {
    type: "string" as const,
    label: "Custom Scripts (body end)",
    default: "",
    multiline: true,
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
  sitemapDefaultPriority: { type: "number" as const, label: "Default Priority (0.0-1.0)", default: 0.5, min: 0, max: 1 },
  robotsTxtCustom: { type: "string" as const, label: "Custom robots.txt Rules", default: "", multiline: true },
  robotsCrawlDelay: { type: "number" as const, label: "Crawl Delay (seconds)", default: 0, min: 0, max: 60 },
  bingVerification: { type: "string" as const, label: "Bing Verification Code", default: "" },
  pinterestVerification: { type: "string" as const, label: "Pinterest Verification Code", default: "" },
  yandexVerification: { type: "string" as const, label: "Yandex Verification Code", default: "" },

  // Phase 6: Social & Sharing
  enableAutoPost: { type: "boolean" as const, label: "Auto-Post on Publish", default: false },
  twitterApiKey: { type: "secret" as const, label: "Twitter API Key" },
  twitterApiSecret: { type: "secret" as const, label: "Twitter API Secret" },
  blueskyHandle: { type: "string" as const, label: "Bluesky Handle", default: "" },
  blueskyAppPassword: { type: "secret" as const, label: "Bluesky App Password" },
  socialPostTemplate: {
    type: "string" as const,
    label: "Social Post Template",
    default: "New: {title} \u2014 {url}",
  },

  // Phase 8: hreflang / Multi-Language
  hreflangEnabled: { type: "boolean" as const, label: "Enable hreflang Tags", default: false },
  hreflangMappings: { type: "string" as const, label: "Language Mappings (JSON)", default: "", multiline: true },

  // Phase 11: IndexNow
  indexNowApiKey: { type: "string" as const, label: "IndexNow API Key", default: "" },

  // Phase 12: Specialty Sitemaps
  newsSitemapEnabled: { type: "boolean" as const, label: "Enable News Sitemap", default: false },
  videoSitemapEnabled: { type: "boolean" as const, label: "Enable Video Sitemap", default: false },
  imageSitemapEnabled: { type: "boolean" as const, label: "Enable Image Sitemap", default: false },

  // Phase 13: Google Search Console
  gscAccessToken: { type: "secret" as const, label: "Google Search Console Access Token" },

  // Phase 7: Licensing
  licenseKey: { type: "secret" as const, label: "License Key" },
};
