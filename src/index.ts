import { definePlugin } from "emdash";
import type { PluginDefinition } from "emdash";
import { CAPABILITIES } from "./capabilities.js";
import { STORAGE } from "./storage.js";
import { SETTINGS_SCHEMA } from "./settings.js";
import { metadataHandler } from "./hooks/metadata.js";
import { fragmentsHandler } from "./hooks/fragments.js";
import { lifecycleHooks } from "./hooks/lifecycle.js";
import { overrideRoutes } from "./routes/overrides.js";
import { sitemapRoutes } from "./routes/sitemap.js";
import { robotsRoutes } from "./routes/robots.js";

const definition: PluginDefinition = {
  id: "@emdash-seo/toolkit",
  version: "0.1.0",

  capabilities: CAPABILITIES,
  storage: STORAGE,

  hooks: {
    "plugin:activate": lifecycleHooks["plugin:activate"] as any,
    "plugin:install": lifecycleHooks["plugin:install"] as any,
    "page:metadata": metadataHandler as any,
    "page:fragments": fragmentsHandler as any,
  },

  routes: {
    ...overrideRoutes,
    ...sitemapRoutes,
    ...robotsRoutes,
  } as any,

  admin: {
    settingsSchema: SETTINGS_SCHEMA,
    pages: [
      { path: "seo-overrides", label: "SEO Overrides", icon: "search" },
    ],
    widgets: [
      { id: "seo-status", title: "SEO Status", size: "half" },
    ],
  },
};

export default () => definePlugin(definition);
