import type { SeoCheck } from "../types.js";

interface MediaItem {
  url?: string;
  width?: number;
  height?: number;
  type?: string;
}

interface MediaCtx {
  get(id: string): Promise<MediaItem | null>;
}

const OG_RECOMMENDED_WIDTH = 1200;
const OG_RECOMMENDED_HEIGHT = 630;

export async function checkOgImage(
  ogImageUrl: string | undefined,
  media?: MediaCtx,
): Promise<SeoCheck> {
  if (!ogImageUrl) {
    return { id: "og-image", label: "OG Image", status: "warn", message: "No OG image set", weight: 5 };
  }

  if (!media) {
    return { id: "og-image", label: "OG Image", status: "pass", message: "OG image URL is set (cannot validate without media access)", weight: 5 };
  }

  // Try to extract media ID from URL (emdash media URLs typically contain the asset ID)
  const mediaId = extractMediaId(ogImageUrl);
  if (!mediaId) {
    return { id: "og-image", label: "OG Image", status: "pass", message: "OG image is set (external URL)", weight: 5 };
  }

  try {
    const item = await media.get(mediaId);
    if (!item) {
      return { id: "og-image", label: "OG Image", status: "fail", message: "OG image not found in media library", weight: 5 };
    }

    if (item.width && item.height) {
      if (item.width >= OG_RECOMMENDED_WIDTH && item.height >= OG_RECOMMENDED_HEIGHT) {
        return { id: "og-image", label: "OG Image", status: "pass", message: `OG image dimensions are good (${item.width}x${item.height})`, weight: 5 };
      }
      return { id: "og-image", label: "OG Image", status: "warn", message: `OG image is small (${item.width}x${item.height}), recommended ${OG_RECOMMENDED_WIDTH}x${OG_RECOMMENDED_HEIGHT}`, weight: 5 };
    }

    return { id: "og-image", label: "OG Image", status: "pass", message: "OG image exists in media library", weight: 5 };
  } catch {
    return { id: "og-image", label: "OG Image", status: "pass", message: "OG image URL is set", weight: 5 };
  }
}

// Extract media asset ID from a URL path like /media/abc123 or /_media/abc123.jpg
function extractMediaId(url: string): string | null {
  const match = url.match(/\/(?:_?media|uploads?)\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
