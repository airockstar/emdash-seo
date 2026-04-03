import React from "react";
import { SeoOverridesPage } from "./pages/seo-overrides.js";
import { ContentAnalysisPage } from "./pages/content-analysis.js";
import { SeoStatusWidget } from "./widgets/seo-status.js";
import { SeoScoreWidget } from "./widgets/seo-score.js";

export const pages = {
  "seo-overrides": SeoOverridesPage,
  "content-analysis": ContentAnalysisPage,
};

export const widgets = {
  "seo-status": SeoStatusWidget,
  "seo-score": SeoScoreWidget,
};
