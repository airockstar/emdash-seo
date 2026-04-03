import type { SeoCheck } from "../types.js";
import { DESC_MIN, DESC_MAX } from "../constants.js";

export function checkDescriptionLength(description: string | undefined): SeoCheck {
  if (!description) {
    return { id: "desc-length", label: "Description Length", status: "fail", message: "Meta description is missing", weight: 10 };
  }
  if (description.length < DESC_MIN) {
    return { id: "desc-length", label: "Description Length", status: "warn", message: `Description is too short (${description.length}/${DESC_MIN}-${DESC_MAX} chars)`, weight: 10 };
  }
  if (description.length > DESC_MAX) {
    return { id: "desc-length", label: "Description Length", status: "warn", message: `Description is too long (${description.length}/${DESC_MAX} chars max)`, weight: 10 };
  }
  return { id: "desc-length", label: "Description Length", status: "pass", message: `Description length is good (${description.length} chars)`, weight: 10 };
}

export function checkDescriptionKeyword(description: string | undefined, keyword: string | undefined): SeoCheck {
  if (!keyword) {
    return { id: "desc-keyword", label: "Focus Keyword in Description", status: "warn", message: "No focus keyword set", weight: 10 };
  }
  if (!description) {
    return { id: "desc-keyword", label: "Focus Keyword in Description", status: "fail", message: "Description is missing", weight: 10 };
  }
  const found = description.toLowerCase().includes(keyword.toLowerCase());
  return {
    id: "desc-keyword",
    label: "Focus Keyword in Description",
    status: found ? "pass" : "fail",
    message: found ? "Focus keyword found in description" : "Focus keyword not found in description",
    weight: 10,
  };
}
