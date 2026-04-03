export function formatSocialPost(
  template: string,
  content: { title?: string; url?: string; description?: string },
): string {
  return template
    .replace("{title}", content.title ?? "")
    .replace("{url}", content.url ?? "")
    .replace("{description}", content.description ?? "")
    .trim();
}
