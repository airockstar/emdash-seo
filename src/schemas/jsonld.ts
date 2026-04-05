export interface AuthorData {
  name: string;
  url?: string;
  image?: string;
}

export function buildArticleSchema(data: {
  headline?: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string | AuthorData;
  publisherName?: string;
  publisherLogo?: string;
  url?: string;
}): Record<string, unknown> {
  const authorSchema = data.author
    ? typeof data.author === "string"
      ? { "@type": "Person", name: data.author }
      : clean({
          "@type": "Person",
          name: data.author.name,
          url: data.author.url,
          image: data.author.image,
        })
    : undefined;

  return clean({
    "@type": "Article",
    headline: data.headline,
    description: data.description,
    image: data.image,
    url: data.url,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    author: authorSchema,
    publisher: data.publisherName
      ? clean({
          "@type": "Organization",
          name: data.publisherName,
          logo: data.publisherLogo
            ? { "@type": "ImageObject", url: data.publisherLogo }
            : undefined,
        })
      : undefined,
  });
}

export function buildWebPageSchema(data: {
  name: string;
  description?: string;
  url: string;
}): Record<string, unknown> {
  return clean({
    "@type": "WebPage",
    name: data.name,
    description: data.description,
    url: data.url,
  });
}

export function buildBreadcrumbSchema(
  url: string,
  siteName: string,
  customLabel?: string,
): Record<string, unknown> {
  const parsed = new URL(url);
  const segments = parsed.pathname
    .split("/")
    .filter((s) => s.length > 0);

  const items: Record<string, unknown>[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: siteName || "Home",
      item: `${parsed.origin}/`,
    },
  ];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    items.push({
      "@type": "ListItem",
      position: i + 2,
      name: isLast && customLabel ? customLabel : capitalize(segments[i].replace(/-/g, " ")),
      item: `${parsed.origin}${currentPath}`,
    });
  }

  return {
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function buildOrganizationSchema(data: {
  name: string;
  url: string;
  logo?: string;
}): Record<string, unknown> {
  return clean({
    "@type": "Organization",
    name: data.name,
    url: data.url,
    logo: data.logo
      ? { "@type": "ImageObject", url: data.logo }
      : undefined,
  });
}

export function buildWebSiteSchema(data: {
  name: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${data.url}?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function clean(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  );
}
