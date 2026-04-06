import { definePlugin } from "emdash";
import type { PluginDefinition } from "emdash";
import { CAPABILITIES } from "./capabilities.js";
import { STORAGE } from "./storage.js";
import { SETTINGS_SCHEMA } from "./settings.js";
import { metadataHandler } from "./hooks/metadata.js";
import { fragmentsHandler } from "./hooks/fragments.js";
import { lifecycleHooks } from "./hooks/lifecycle.js";
import { contentAfterSaveHook } from "./hooks/content-after-save.js";
import { cronHook } from "./hooks/cron.js";
import { overrideRoutes } from "./routes/overrides.js";
import { sitemapRoutes } from "./routes/sitemap.js";
import { robotsRoutes } from "./routes/robots.js";
import { analyticsStatusRoutes } from "./routes/analytics-status.js";
import { analyzeRoutes } from "./routes/analyze.js";
import { scoresRoutes } from "./routes/scores.js";
import { socialRoutes } from "./routes/social.js";
import { licenseRoutes } from "./routes/license.js";
import { redirectRoutes } from "./routes/redirects.js";

// ─── Plugin Descriptor (for astro.config.mjs) ───────────────────

export default function seoToolkit() {
  return {
    id: "@emdash-seo/toolkit",
    version: "0.2.2",
    entrypoint: "@ai-rockstar/emdash-seo",
    adminEntry: "@ai-rockstar/emdash-seo/admin",
    options: {},
    capabilities: [...CAPABILITIES],
    allowedHosts: ["api.twitter.com", "api.x.com", "bsky.social", "*.bsky.social", "api.indexnow.org", "www.googleapis.com"],
    storage: STORAGE,
    adminPages: [
      { path: "seo-overrides", label: "SEO Overrides", icon: "search" },
      { path: "content-analysis", label: "Content Analysis", icon: "chart" },
      { path: "redirects", label: "Redirects", icon: "link" },
    ],
    adminWidgets: [
      { id: "seo-status", title: "SEO Status", size: "half" as const },
      { id: "seo-score", title: "SEO Score", size: "half" as const },
    ],
    settingsSchema: SETTINGS_SCHEMA,
  };
}

// ─── Plugin Implementation (loaded by Emdash runtime) ────────────

const definition: PluginDefinition = {
  id: "@emdash-seo/toolkit",
  version: "0.2.2",

  capabilities: CAPABILITIES,
  allowedHosts: ["api.twitter.com", "api.x.com", "bsky.social", "*.bsky.social", "api.indexnow.org", "www.googleapis.com"],
  storage: STORAGE,

  hooks: {
    "plugin:activate": lifecycleHooks["plugin:activate"] as any,
    "plugin:install": lifecycleHooks["plugin:install"] as any,
    "plugin:deactivate": lifecycleHooks["plugin:deactivate"] as any,
    "plugin:uninstall": lifecycleHooks["plugin:uninstall"] as any,
    "page:metadata": metadataHandler as any,
    "page:fragments": fragmentsHandler as any,
    "content:afterSave": {
      timeout: 15000,
      errorPolicy: "continue",
      handler: contentAfterSaveHook,
    } as any,
    cron: {
      timeout: 60000,
      handler: cronHook,
    } as any,
  },

  routes: {
    ...overrideRoutes,
    ...sitemapRoutes,
    ...robotsRoutes,
    ...analyticsStatusRoutes,
    ...analyzeRoutes,
    ...scoresRoutes,
    ...socialRoutes,
    ...licenseRoutes,
    ...redirectRoutes,
  } as any,

  admin: {
    settingsSchema: SETTINGS_SCHEMA,
    fieldWidgets: [
      {
        name: "seo-fields",
        label: "SEO",
        fieldTypes: ["json", "string"],
      },
    ],
    pages: [
      { path: "seo-overrides", label: "SEO Overrides", icon: "search" },
      { path: "content-analysis", label: "Content Analysis", icon: "chart" },
      { path: "redirects", label: "Redirects", icon: "link" },
    ],
    widgets: [
      { id: "seo-status", title: "SEO Status", size: "half" },
      { id: "seo-score", title: "SEO Score", size: "half" },
    ],
  },
};

export function createPlugin() {
  return definePlugin(definition);
}
