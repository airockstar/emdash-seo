export interface AltSuggestion {
  imageIndex: number;
  src?: string;
  suggestedAlt: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Suggest alt text for images missing alt attributes.
 * Uses filename from src URL (high confidence) or content title as fallback (low confidence).
 */
export function suggestAltText(
  images: Array<{ alt?: string; src?: string }>,
  contentTitle: string,
): AltSuggestion[] {
  const suggestions: AltSuggestion[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];

    // Only suggest for images missing alt
    if (img.alt) continue;

    const filenameAlt = extractFilenameAlt(img.src);

    if (filenameAlt) {
      suggestions.push({
        imageIndex: i,
        src: img.src,
        suggestedAlt: filenameAlt,
        confidence: "high",
      });
    } else if (contentTitle) {
      suggestions.push({
        imageIndex: i,
        src: img.src,
        suggestedAlt: contentTitle,
        confidence: "low",
      });
    }
  }

  return suggestions;
}

/**
 * Extract a human-readable alt text from an image filename.
 * Strips the extension and replaces dashes/underscores with spaces.
 */
function extractFilenameAlt(src: string | undefined): string | null {
  if (!src) return null;

  try {
    const url = new URL(src, "https://placeholder.invalid");
    const pathname = url.pathname;
    const filename = pathname.split("/").pop();
    if (!filename) return null;

    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
    if (!nameWithoutExt) return null;

    // Replace dashes and underscores with spaces, trim
    const alt = nameWithoutExt.replace(/[-_]+/g, " ").trim();
    return alt || null;
  } catch {
    return null;
  }
}
