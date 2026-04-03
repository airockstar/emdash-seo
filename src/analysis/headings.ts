import type { SeoCheck } from "../types.js";
import type { Heading } from "../utils/portable-text.js";

export function checkSingleH1(headings: Heading[]): SeoCheck {
  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length === 0) {
    return { id: "single-h1", label: "H1 Heading", status: "fail", message: "No H1 heading found", weight: 10 };
  }
  if (h1s.length > 1) {
    return { id: "single-h1", label: "H1 Heading", status: "fail", message: `Multiple H1 headings found (${h1s.length})`, weight: 10 };
  }
  return { id: "single-h1", label: "H1 Heading", status: "pass", message: "Single H1 heading found", weight: 10 };
}

export function checkHeadingHierarchy(headings: Heading[]): SeoCheck {
  if (headings.length === 0) {
    return { id: "heading-hierarchy", label: "Heading Hierarchy", status: "warn", message: "No headings found", weight: 5 };
  }

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    // Skipping levels (e.g. H1 -> H3) is a hierarchy issue
    if (curr > prev + 1) {
      return {
        id: "heading-hierarchy",
        label: "Heading Hierarchy",
        status: "warn",
        message: `Heading hierarchy skips from H${prev} to H${curr}`,
        weight: 5,
      };
    }
  }

  return { id: "heading-hierarchy", label: "Heading Hierarchy", status: "pass", message: "Heading hierarchy is correct", weight: 5 };
}
