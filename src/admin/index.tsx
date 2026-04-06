import type { PluginAdminExports } from "emdash";
import { SeoOverridesPage } from "./pages/seo-overrides.js";
import { ContentAnalysisPage } from "./pages/content-analysis.js";
import { RedirectsPage } from "./pages/redirects.js";
import { SeoStatusWidget } from "./widgets/seo-status.js";
import { SeoScoreWidget } from "./widgets/seo-score.js";
import { SeoFieldsWidget } from "./widgets/seo-fields.js";

export const pages: PluginAdminExports["pages"] = {
  "/": SeoOverridesPage,
  "/analysis": ContentAnalysisPage,
  "/redirects": RedirectsPage,
};

export const widgets: PluginAdminExports["widgets"] = {
  "seo-status": SeoStatusWidget,
  "seo-score": SeoScoreWidget,
};

export const fields: PluginAdminExports["fields"] = {
  "seo-fields": SeoFieldsWidget,
};
