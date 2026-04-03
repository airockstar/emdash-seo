import type { SeoCheck } from "../types.js";

export function checkKeywordDensity(text: string, keyword: string | undefined): SeoCheck {
  if (!keyword) {
    return { id: "keyword-density", label: "Keyword Density", status: "warn", message: "No focus keyword set", weight: 5 };
  }
  if (!text) {
    return { id: "keyword-density", label: "Keyword Density", status: "fail", message: "No content to analyze", weight: 5 };
  }

  const words = text.toLowerCase().match(/\b\w+\b/g) ?? [];
  const totalWords = words.length;
  if (totalWords === 0) {
    return { id: "keyword-density", label: "Keyword Density", status: "fail", message: "No content to analyze", weight: 5 };
  }

  const keywordLower = keyword.toLowerCase();
  const escaped = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  const matches = text.match(regex);
  const count = matches ? matches.length : 0;

  const density = (count * keyword.split(/\s+/).length / totalWords) * 100;
  const rounded = Math.round(density * 10) / 10;

  if (density < 0.5) {
    return { id: "keyword-density", label: "Keyword Density", status: "warn", message: `Keyword density is low (${rounded}%)`, weight: 5 };
  }
  if (density > 3) {
    return { id: "keyword-density", label: "Keyword Density", status: "warn", message: `Keyword density is high (${rounded}%) — may appear as keyword stuffing`, weight: 5 };
  }
  return { id: "keyword-density", label: "Keyword Density", status: "pass", message: `Keyword density is good (${rounded}%)`, weight: 5 };
}

export function checkKeywordInFirstParagraph(text: string, keyword: string | undefined): SeoCheck {
  if (!keyword) {
    return { id: "keyword-first-para", label: "Keyword in Introduction", status: "warn", message: "No focus keyword set", weight: 5 };
  }
  if (!text) {
    return { id: "keyword-first-para", label: "Keyword in Introduction", status: "fail", message: "No content to analyze", weight: 5 };
  }

  const firstChunk = text.slice(0, 300);
  const found = firstChunk.toLowerCase().includes(keyword.toLowerCase());
  return {
    id: "keyword-first-para",
    label: "Keyword in Introduction",
    status: found ? "pass" : "fail",
    message: found
      ? "Focus keyword found in the introduction"
      : "Focus keyword not found in the first 300 characters",
    weight: 5,
  };
}
