import type { SeoCheck } from "../types.js";
import { TITLE_MIN, TITLE_MAX } from "../constants.js";

export function checkTitleLength(title: string | undefined): SeoCheck {
  if (!title) {
    return { id: "title-length", label: "Title Length", status: "fail", message: "Title is missing", weight: 10 };
  }
  if (title.length < TITLE_MIN) {
    return { id: "title-length", label: "Title Length", status: "warn", message: `Title is too short (${title.length}/${TITLE_MIN}-${TITLE_MAX} chars)`, weight: 10 };
  }
  if (title.length > TITLE_MAX) {
    return { id: "title-length", label: "Title Length", status: "warn", message: `Title is too long (${title.length}/${TITLE_MAX} chars max)`, weight: 10 };
  }
  return { id: "title-length", label: "Title Length", status: "pass", message: `Title length is good (${title.length} chars)`, weight: 10 };
}

export function checkTitleKeyword(title: string | undefined, keyword: string | undefined): SeoCheck {
  if (!keyword) {
    return { id: "title-keyword", label: "Focus Keyword in Title", status: "warn", message: "No focus keyword set", weight: 10 };
  }
  if (!title) {
    return { id: "title-keyword", label: "Focus Keyword in Title", status: "fail", message: "Title is missing", weight: 10 };
  }
  const found = title.toLowerCase().includes(keyword.toLowerCase());
  return {
    id: "title-keyword",
    label: "Focus Keyword in Title",
    status: found ? "pass" : "fail",
    message: found ? "Focus keyword found in title" : "Focus keyword not found in title",
    weight: 10,
  };
}
