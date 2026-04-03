export function buildRobotsTxt(config: {
  customRules?: string;
  crawlDelay?: number;
  sitemapUrl?: string;
}): string {
  const lines: string[] = ["User-agent: *", "Allow: /"];

  if (config.crawlDelay && config.crawlDelay > 0) {
    lines.push(`Crawl-delay: ${config.crawlDelay}`);
  }

  if (config.customRules) {
    lines.push("", config.customRules.trim());
  }

  if (config.sitemapUrl) {
    lines.push("", `Sitemap: ${config.sitemapUrl}`);
  }

  return lines.join("\n") + "\n";
}
