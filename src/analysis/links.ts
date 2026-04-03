import type { SeoCheck } from "../types.js";
import type { LinkRef } from "../utils/portable-text.js";

export function checkInternalLinks(links: LinkRef[]): SeoCheck {
  const internal = links.filter((l) => l.internal);

  if (internal.length >= 2) {
    return { id: "internal-links", label: "Internal Links", status: "pass", message: `${internal.length} internal links found`, weight: 5 };
  }
  if (internal.length === 1) {
    return { id: "internal-links", label: "Internal Links", status: "warn", message: "Only 1 internal link found — add more for better SEO", weight: 5 };
  }
  return { id: "internal-links", label: "Internal Links", status: "fail", message: "No internal links found", weight: 5 };
}
