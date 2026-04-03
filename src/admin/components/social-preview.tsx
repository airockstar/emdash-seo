import React from "react";

interface SocialPreviewProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  platform: "facebook" | "twitter" | "linkedin";
}

const CARD_STYLES: Record<string, React.CSSProperties> = {
  facebook: { maxWidth: 524, border: "1px solid #dadde1", borderRadius: 2, overflow: "hidden", fontFamily: "Helvetica, Arial, sans-serif" },
  twitter: { maxWidth: 504, border: "1px solid #e1e8ed", borderRadius: 14, overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" },
  linkedin: { maxWidth: 552, border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" },
};

export function SocialPreview({ title, description, image, url, platform }: SocialPreviewProps) {
  const domain = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  const truncTitle = title.length > 70 ? title.slice(0, 67) + "..." : title;
  const truncDesc = description.length > 100 ? description.slice(0, 97) + "..." : description;

  return (
    <div style={CARD_STYLES[platform]}>
      {image && (
        <div style={{ width: "100%", height: 260, backgroundColor: "#f0f0f0", overflow: "hidden" }}>
          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 12, color: "#606770", textTransform: "uppercase", marginBottom: 4 }}>
          {domain}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1d2129", marginBottom: 4, lineHeight: 1.3 }}>
          {truncTitle || "Page Title"}
        </div>
        <div style={{ fontSize: 14, color: "#606770", lineHeight: 1.4 }}>
          {truncDesc}
        </div>
      </div>
    </div>
  );
}
