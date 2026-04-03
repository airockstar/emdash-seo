import type { SeoCheck } from "../types.js";

/**
 * Flesch-Kincaid Reading Ease score.
 * 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
 * Higher = easier to read. Target: 60-70 for web content.
 */
export function checkReadability(text: string): SeoCheck {
  if (!text || text.trim().length < 50) {
    return { id: "readability", label: "Readability", status: "warn", message: "Not enough text to analyze readability", weight: 5 };
  }

  const sentences = countSentences(text);
  const words = countWords(text);
  const syllables = countSyllables(text);

  if (words === 0 || sentences === 0) {
    return { id: "readability", label: "Readability", status: "warn", message: "Not enough text to analyze readability", weight: 5 };
  }

  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  const rounded = Math.round(score * 10) / 10;

  if (score >= 60) {
    return { id: "readability", label: "Readability", status: "pass", message: `Readability score: ${rounded} (good)`, weight: 5 };
  }
  if (score >= 30) {
    return { id: "readability", label: "Readability", status: "warn", message: `Readability score: ${rounded} (difficult)`, weight: 5 };
  }
  return { id: "readability", label: "Readability", status: "fail", message: `Readability score: ${rounded} (very difficult)`, weight: 5 };
}

function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 1;
}

function countWords(text: string): number {
  const matches = text.match(/\b\w+\b/g);
  return matches ? matches.length : 0;
}

// Syllable counting heuristic: count vowel groups
function countSyllables(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
  let total = 0;
  for (const word of words) {
    let count = (word.match(/[aeiouy]+/g) ?? []).length;
    if (word.endsWith("e") && count > 1) count--;
    if (count === 0) count = 1;
    total += count;
  }
  return total;
}
