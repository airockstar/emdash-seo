export interface LinkSuggestion {
  targetId: string;
  targetTitle: string;
  targetUrl: string;
  matchedPhrase: string;
  relevanceScore: number;
}

/**
 * Suggest internal links by checking if other content titles (or title words)
 * appear in the given text. Scored by word overlap.
 */
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

    const titleWords = title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    if (titleWords.length === 0) continue;

    const matchedWords = titleWords.filter((w) => lowerText.includes(w));
    if (matchedWords.length === 0) continue;

    const relevanceScore = Math.round((matchedWords.length / titleWords.length) * 100) / 100;

    const collection = item.data.collection ?? "";
    const slug = item.data.slug ?? item.id;
    const targetUrl = `${siteUrl}/${collection}${collection ? "/" : ""}${slug}`;

    suggestions.push({
      targetId: item.id,
      targetTitle: title,
      targetUrl,
      matchedPhrase: matchedWords.join(" "),
      relevanceScore,
    });
  }

  suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return suggestions.slice(0, 5);
}
