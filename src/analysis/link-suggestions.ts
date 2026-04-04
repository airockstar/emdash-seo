export interface LinkSuggestion {
  targetId: string;
  targetTitle: string;
  targetUrl: string;
  matchedPhrase: string;
  relevanceScore: number;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "has", "his", "how", "its", "may",
  "new", "now", "old", "see", "way", "who", "did", "get", "let", "say",
  "she", "too", "use", "top", "best", "most", "also", "been", "from",
  "have", "here", "just", "like", "make", "many", "more", "much", "must",
  "over", "some", "such", "than", "that", "them", "then", "they", "this",
  "very", "what", "when", "will", "with", "your", "about", "after", "being",
  "could", "every", "first", "into", "other", "should", "their", "there",
  "these", "those", "under", "which", "while", "would",
]);

export function suggestInternalLinks(
  text: string,
  currentId: string,
  allContent: Array<{ id: string; data: { title?: string; collection?: string; slug?: string } }>,
  siteUrl: string,
): LinkSuggestion[] {
  if (!text || allContent.length === 0) return [];

  const lowerText = text.toLowerCase();
  const suggestions: LinkSuggestion[] = [];

  for (const item of allContent) {
    if (item.id === currentId) continue;

    const title = item.data.title;
    if (!title) continue;

    // Check if full title appears in text (highest relevance)
    const lowerTitle = title.toLowerCase();
    if (lowerText.includes(lowerTitle)) {
      const collection = item.data.collection ?? "";
      const slug = item.data.slug ?? item.id;
      suggestions.push({
        targetId: item.id,
        targetTitle: title,
        targetUrl: `${siteUrl}/${collection}${collection ? "/" : ""}${slug}`,
        matchedPhrase: title,
        relevanceScore: 1.0,
      });
      continue;
    }

    // Fall back to significant word overlap (min 4 chars, no stop words)
    const titleWords = lowerTitle
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));

    if (titleWords.length === 0) continue;

    const matchedWords = titleWords.filter((w) => lowerText.includes(w));
    if (matchedWords.length < 2) continue; // require at least 2 significant word matches

    const relevanceScore = Math.round((matchedWords.length / titleWords.length) * 100) / 100;
    const collection = item.data.collection ?? "";
    const slug = item.data.slug ?? item.id;

    suggestions.push({
      targetId: item.id,
      targetTitle: title,
      targetUrl: `${siteUrl}/${collection}${collection ? "/" : ""}${slug}`,
      matchedPhrase: matchedWords.join(" "),
      relevanceScore,
    });
  }

  suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return suggestions.slice(0, 5);
}
