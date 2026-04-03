import {
  extractPlainText,
  type PortableTextBlock,
  type PortableTextImageBlock,
} from "emdash";

export { extractPlainText };
export type { PortableTextBlock };

export interface Heading {
  level: number;
  text: string;
}

export interface ImageRef {
  alt?: string;
  src?: string;
  caption?: string;
}

export interface LinkRef {
  href: string;
  text: string;
  internal: boolean;
}

const HEADING_STYLES: Record<string, number> = {
  h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6,
};

export function extractHeadings(blocks: PortableTextBlock[]): Heading[] {
  const headings: Heading[] = [];

  for (const block of blocks) {
    if (block._type !== "block" || !("style" in block) || !block.style) continue;
    const level = HEADING_STYLES[block.style as string];
    if (!level) continue;

    const text = ("children" in block && Array.isArray(block.children))
      ? block.children.map((child: any) => child.text ?? "").join("")
      : "";
    if (text) headings.push({ level, text });
  }

  return headings;
}

export function extractImages(blocks: PortableTextBlock[]): ImageRef[] {
  const images: ImageRef[] = [];

  for (const block of blocks) {
    if (block._type !== "image") continue;
    const img = block as unknown as PortableTextImageBlock;
    images.push({
      alt: img.alt,
      src: img.asset?.url,
      caption: (img as any).caption,
    });
  }

  return images;
}

export function extractLinks(
  blocks: PortableTextBlock[],
  siteUrl?: string,
): LinkRef[] {
  const links: LinkRef[] = [];

  for (const block of blocks) {
    if (block._type !== "block") continue;
    const markDefs = "markDefs" in block && Array.isArray(block.markDefs)
      ? block.markDefs
      : [];

    const linkDefs = new Map<string, string>();
    for (const def of markDefs) {
      if (def._type === "link" && def.href) {
        linkDefs.set(def._key, def.href);
      }
    }
    if (linkDefs.size === 0) continue;

    const children = "children" in block && Array.isArray(block.children)
      ? block.children
      : [];
    for (const child of children) {
      if (!child.marks) continue;
      for (const mark of child.marks) {
        const href = linkDefs.get(mark);
        if (href) {
          const internal = siteUrl
            ? href.startsWith(siteUrl) || href.startsWith("/")
            : href.startsWith("/");
          links.push({ href, text: child.text ?? "", internal });
        }
      }
    }
  }

  return links;
}
