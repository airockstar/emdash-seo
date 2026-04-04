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

const PASSIVE_PATTERN = /\b(?:was|were|is|are|been|being)\s+\w+ed\b/gi;

const TRANSITION_WORDS = [
  "however", "therefore", "moreover", "furthermore", "additionally",
  "consequently", "meanwhile", "nevertheless", "although",
];

/**
 * Check for excessive passive voice usage.
 * Warns if >10% of sentences contain passive constructions.
 */
export function checkPassiveVoice(text: string): SeoCheck {
  if (!text || text.trim().length < 50) {
    return { id: "passive-voice", label: "Passive Voice", status: "pass", message: "Not enough text to check passive voice", weight: 3 };
  }

  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return { id: "passive-voice", label: "Passive Voice", status: "pass", message: "No sentences found", weight: 3 };
  }

  const passiveCount = sentences.filter((s) => PASSIVE_PATTERN.test(s)).length;
  const ratio = passiveCount / sentences.length;

  if (ratio > 0.1) {
    const pct = Math.round(ratio * 100);
    return { id: "passive-voice", label: "Passive Voice", status: "warn", message: `${pct}% of sentences use passive voice — aim for less than 10%`, weight: 3 };
  }
  return { id: "passive-voice", label: "Passive Voice", status: "pass", message: "Passive voice usage is acceptable", weight: 3 };
}

/**
 * Check for excessively long sentences.
 * Warns if >25% of sentences exceed 20 words.
 */
export function checkSentenceLength(text: string): SeoCheck {
  if (!text || text.trim().length < 50) {
    return { id: "sentence-length", label: "Sentence Length", status: "pass", message: "Not enough text to check sentence length", weight: 3 };
  }

  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return { id: "sentence-length", label: "Sentence Length", status: "pass", message: "No sentences found", weight: 3 };
  }

  const longCount = sentences.filter((s) => countWords(s) > 20).length;
  const ratio = longCount / sentences.length;

  if (ratio > 0.25) {
    const pct = Math.round(ratio * 100);
    return { id: "sentence-length", label: "Sentence Length", status: "warn", message: `${pct}% of sentences are over 20 words — aim for less than 25%`, weight: 3 };
  }
  return { id: "sentence-length", label: "Sentence Length", status: "pass", message: "Sentence length is good", weight: 3 };
}

/**
 * Check for transition word usage.
 * Warns if <20% of sentences contain a transition word.
 */
export function checkTransitionWords(text: string): SeoCheck {
  if (!text || text.trim().length < 50) {
    return { id: "transition-words", label: "Transition Words", status: "pass", message: "Not enough text to check transition words", weight: 3 };
  }

  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return { id: "transition-words", label: "Transition Words", status: "pass", message: "No sentences found", weight: 3 };
  }

  const pattern = new RegExp(`\\b(?:${TRANSITION_WORDS.join("|")})\\b`, "i");
  const withTransition = sentences.filter((s) => pattern.test(s)).length;
  const ratio = withTransition / sentences.length;

  if (ratio < 0.2) {
    const pct = Math.round(ratio * 100);
    return { id: "transition-words", label: "Transition Words", status: "warn", message: `Only ${pct}% of sentences use transition words — aim for at least 20%`, weight: 3 };
  }
  return { id: "transition-words", label: "Transition Words", status: "pass", message: "Good use of transition words", weight: 3 };
}

/**
 * Check for excessively long paragraphs.
 * Warns if any paragraph exceeds 150 words.
 */
export function checkParagraphLength(text: string): SeoCheck {
  if (!text || text.trim().length < 50) {
    return { id: "paragraph-length", label: "Paragraph Length", status: "pass", message: "Not enough text to check paragraph length", weight: 3 };
  }

  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const longParagraphs = paragraphs.filter((p) => countWords(p) > 150);

  if (longParagraphs.length > 0) {
    return { id: "paragraph-length", label: "Paragraph Length", status: "warn", message: `${longParagraphs.length} paragraph(s) exceed 150 words — break them up for readability`, weight: 3 };
  }
  return { id: "paragraph-length", label: "Paragraph Length", status: "pass", message: "Paragraph lengths are good", weight: 3 };
}

function splitSentences(text: string): string[] {
  return text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
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
