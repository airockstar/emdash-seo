export interface BrokenLink {
  url: string;
  status: number | "error";
  text: string;
}

const MAX_LINKS = 20;

/**
 * Check internal links for broken status via HEAD requests.
 * Limited to first 20 links to avoid timeout.
 */
export async function checkBrokenLinks(
  links: Array<{ href: string; text: string; internal: boolean }>,
  http: { fetch(url: string, init?: RequestInit): Promise<Response> },
  siteUrl: string,
): Promise<BrokenLink[]> {
  const toCheck = links.slice(0, MAX_LINKS);
  const broken: BrokenLink[] = [];

  const results = await Promise.allSettled(
    toCheck.map(async (link) => {
      const url = link.href.startsWith("/")
        ? `${siteUrl}${link.href}`
        : link.href;
      try {
        const response = await http.fetch(url, { method: "HEAD" });
        if (response.status >= 400) {
          return { url, status: response.status, text: link.text };
        }
        return null;
      } catch {
        return { url, status: "error" as const, text: link.text };
      }
    }),
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      broken.push(result.value);
    }
  }

  return broken;
}
