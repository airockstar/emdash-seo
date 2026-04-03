import React, { useEffect } from "react";
import { globalStyles } from "./styles.js";
import { SeoOverridesPage } from "./pages/seo-overrides.js";
import { ContentAnalysisPage } from "./pages/content-analysis.js";
import { SeoStatusWidget } from "./widgets/seo-status.js";
import { SeoScoreWidget } from "./widgets/seo-score.js";

// Inject global styles once
let stylesInjected = false;
function useGlobalStyles() {
  useEffect(() => {
    if (stylesInjected) return;
    const style = document.createElement("style");
    style.textContent = globalStyles;
    style.setAttribute("data-seo-plugin", "");
    document.head.appendChild(style);
    stylesInjected = true;
    return () => {
      style.remove();
      stylesInjected = false;
    };
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
