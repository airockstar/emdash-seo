import { DEFAULT_SEPARATOR } from "../constants.js";

export function formatTitle(
  template: string,
  title: string,
  siteName: string,
  separator?: string,
): string {
  const sep = separator ?? DEFAULT_SEPARATOR;

  let result = template
    .replace("{title}", title)
    .replace("{site}", siteName)
    .replace("{sep}", sep);

  // Clean up dangling separators when title or site is empty
  const escaped = escapeRegex(sep);
  result = result
    .replace(new RegExp(`^\\s*${escaped}\\s*`), "")
    .replace(new RegExp(`\\s*${escaped}\\s*$`), "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
