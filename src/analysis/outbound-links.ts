import type { SeoCheck } from "../types.js";
import type { LinkRef } from "../utils/portable-text.js";

export function checkOutboundLinks(links: LinkRef[]): SeoCheck {
  const external = links.filter((l) => !l.internal);

  if (external.length >= 1) {
    return {
      id: "outbound-links",
      label: "Outbound Links",
      status: "pass",
      message: `${external.length} outbound link${external.length === 1 ? "" : "s"} found`,
      weight: 3,
    };
  }

  return {
    id: "outbound-links",
    label: "Outbound Links",
    status: "warn",
    message: "No outbound links found — linking to authoritative sources can improve credibility",
    weight: 3,
  };
}
