import React, { useEffect } from "react";
import { globalStyles } from "./styles.js";
import { SeoOverridesPage } from "./pages/seo-overrides.js";
import { ContentAnalysisPage } from "./pages/content-analysis.js";
import { SeoStatusWidget } from "./widgets/seo-status.js";
import { SeoScoreWidget } from "./widgets/seo-score.js";
import { SeoFieldsWidget } from "./widgets/seo-fields.js";

// Inject global styles once — never remove (persist for plugin lifetime)
let styleRef: HTMLStyleElement | null = null;
function useGlobalStyles() {
  useEffect(() => {
    if (styleRef) return;
    const style = document.createElement("style");
    style.textContent = globalStyles;
    style.setAttribute("data-seo-plugin", "");
    document.head.appendChild(style);
    styleRef = style;
  }, []);
}

function withStyles<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    useGlobalStyles();
    return <Component {...props} />;
  };
}

export const pages = {
  "seo-overrides": withStyles(SeoOverridesPage),
  "content-analysis": withStyles(ContentAnalysisPage),
};

export const widgets = {
  "seo-status": withStyles(SeoStatusWidget),
  "seo-score": withStyles(SeoScoreWidget),
};

export const fields = {
  "seo-fields": withStyles(SeoFieldsWidget),
};
