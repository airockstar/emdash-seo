import React from "react";
import { colors, fontFamily, radius } from "../tokens.js";
import { truncate, parseDomain } from "./shared.js";

interface SocialPreviewProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  platform: "facebook" | "twitter" | "linkedin";
}

const PLATFORM_RADIUS: Record<string, string> = {
  facebook: radius.sm,
  twitter: "0.875rem",
  linkedin: radius.sm,
};

export function SocialPreview({ title, description, image, url, platform }: SocialPreviewProps) {
  const domain = parseDomain(url);
  const truncTitle = truncate(title, 70);
  const truncDesc = truncate(description, 100);

  return (
    <div
      role="img" aria-label={`${platform} card preview`}
      style={{
        maxWidth: 524, border: `1px solid ${colors.borderDefault}`,
        borderRadius: PLATFORM_RADIUS[platform], overflow: "hidden",
        background: colors.bgPrimary, fontFamily,
      }}
    >
      {image ? (
        <div style={{ width: "100%", height: 274, background: colors.bgTertiary, overflow: "hidden" }}>
          <img src={image} alt={`OG image preview for ${title}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{
          width: "100%", height: 140, background: colors.bgTertiary,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: colors.textTertiary, fontSize: "0.8125rem",
        }}>
          No image set
        </div>
      )}
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: "0.75rem", color: colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 4 }}>
          {domain}
        </div>
        <div style={{ fontSize: "1rem", fontWeight: 600, color: colors.textPrimary, marginBottom: 4, lineHeight: 1.3 }}>
          {truncTitle || <span style={{ color: colors.textTertiary }}>Page title</span>}
        </div>
        <div style={{ fontSize: "0.875rem", color: colors.textSecondary, lineHeight: 1.4 }}>
          {truncDesc}
        </div>
      </div>
    </div>
  );
}
