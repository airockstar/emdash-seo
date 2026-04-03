import React from "react";
import { colors, radius } from "../tokens.js";

interface SerpPreviewProps {
  title: string;
  url: string;
  description: string;
}

export function SerpPreview({ title, url, description }: SerpPreviewProps) {
  const truncTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const truncDesc = description.length > 160 ? description.slice(0, 157) + "..." : description;

  const displayUrl = (() => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname === "/" ? "" : ` › ${parsed.pathname.slice(1).replace(/\//g, " › ")}`;
      return `${parsed.hostname}${path}`;
    } catch {
      return url;
    }
  })();

  return (
    <div
      role="img" aria-label="Google search result preview"
      style={{
        maxWidth: 600, padding: "16px 20px", background: colors.bgPrimary,
        border: `1px solid ${colors.borderDefault}`, borderRadius: radius.lg,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: "0.8125rem", color: colors.serpUrl, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 18, height: 18, borderRadius: "50%", background: colors.bgTertiary, flexShrink: 0 }} />
        {displayUrl}
      </div>
      <div style={{ fontSize: "1.25rem", color: colors.serpTitle, lineHeight: 1.3, marginBottom: 6, cursor: "pointer" }}>
        {truncTitle || <span style={{ color: colors.textTertiary, fontStyle: "italic" }}>Add a page title...</span>}
      </div>
      <div style={{ fontSize: "0.875rem", color: colors.serpDesc, lineHeight: 1.5 }}>
        {truncDesc || <span style={{ color: colors.textTertiary, fontStyle: "italic" }}>Add a meta description to control how this page appears in search results.</span>}
      </div>
    </div>
  );
}
