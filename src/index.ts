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

const definition: PluginDefinition = {
  id: "@emdash-seo/toolkit",
  version: "0.1.0",

  capabilities: CAPABILITIES,
  allowedHosts: ["api.twitter.com", "api.x.com", "bsky.social", "*.bsky.social", "api.indexnow.org"],
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
  } as any,

  admin: {
    entry: "./admin/index.tsx",
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
    ],
    widgets: [
      { id: "seo-status", title: "SEO Status", size: "half" },
      { id: "seo-score", title: "SEO Score", size: "half" },
    ],
  },
};

export default () => definePlugin(definition);
