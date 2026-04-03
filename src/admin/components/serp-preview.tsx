import React from "react";

interface SerpPreviewProps {
  title: string;
  url: string;
  description: string;
}

export function SerpPreview({ title, url, description }: SerpPreviewProps) {
  const truncatedTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const truncatedDesc = description.length > 160 ? description.slice(0, 157) + "..." : description;

  const urlParts = (() => {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname}`;
    } catch {
      return url;
    }
  })();

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 600 }}>
      <div style={{ fontSize: 20, color: "#1a0dab", lineHeight: 1.3, marginBottom: 4 }}>
        {truncatedTitle || "Page Title"}
      </div>
      <div style={{ fontSize: 14, color: "#006621", marginBottom: 4 }}>
        {urlParts}
      </div>
      <div style={{ fontSize: 14, color: "#545454", lineHeight: 1.5 }}>
        {truncatedDesc || "Add a meta description to control how this page appears in search results."}
      </div>
    </div>
  );
}
