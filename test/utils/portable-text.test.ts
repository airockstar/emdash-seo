import { describe, it, expect } from "vitest";
import {
  extractHeadings,
  extractImages,
  extractLinks,
  type PortableTextBlock,
} from "../../src/utils/portable-text.js";

const blocks: PortableTextBlock[] = [
  {
    _type: "block",
    _key: "1",
    style: "h1",
    children: [{ _type: "span", text: "Main Title" }],
  },
  {
    _type: "block",
    _key: "2",
    style: "normal",
    children: [
      { _type: "span", text: "Some text with a " },
      { _type: "span", text: "link", marks: ["link1"] },
      { _type: "span", text: " and more." },
    ],
    markDefs: [{ _type: "link", _key: "link1", href: "https://example.com/page" }],
  },
  {
    _type: "block",
    _key: "3",
    style: "h2",
    children: [{ _type: "span", text: "Subheading" }],
  },
  {
    _type: "image",
    _key: "4",
    alt: "A nice photo",
    asset: { url: "https://example.com/img.jpg" },
  },
  {
    _type: "image",
    _key: "5",
    asset: { url: "https://example.com/no-alt.jpg" },
  },
  {
    _type: "block",
    _key: "6",
    style: "normal",
    children: [
      { _type: "span", text: "Internal ", marks: [] },
      { _type: "span", text: "link here", marks: ["link2"] },
    ],
    markDefs: [{ _type: "link", _key: "link2", href: "/about" }],
  },
];

describe("extractHeadings", () => {
  it("extracts h1 and h2 headings", () => {
    const headings = extractHeadings(blocks);
    expect(headings).toHaveLength(2);
    expect(headings[0]).toEqual({ level: 1, text: "Main Title" });
    expect(headings[1]).toEqual({ level: 2, text: "Subheading" });
  });

  it("ignores non-heading blocks", () => {
    const headings = extractHeadings([
      { _type: "block", style: "normal", children: [{ _type: "span", text: "Just text" }] },
    ]);
    expect(headings).toHaveLength(0);
  });

  it("handles empty blocks array", () => {
    expect(extractHeadings([])).toHaveLength(0);
  });
});

describe("extractImages", () => {
  it("extracts images with and without alt text", () => {
    const images = extractImages(blocks);
    expect(images).toHaveLength(2);
    expect(images[0]).toEqual({ alt: "A nice photo", src: "https://example.com/img.jpg" });
    expect(images[1]).toEqual({ alt: undefined, src: "https://example.com/no-alt.jpg" });
  });

  it("ignores non-image blocks", () => {
    const images = extractImages([
      { _type: "block", style: "normal", children: [{ _type: "span", text: "text" }] },
    ]);
    expect(images).toHaveLength(0);
  });
});

describe("extractLinks", () => {
  it("extracts links with href and text", () => {
    const links = extractLinks(blocks);
    expect(links).toHaveLength(2);
    expect(links[0].href).toBe("https://example.com/page");
    expect(links[0].text).toBe("link");
    expect(links[1].href).toBe("/about");
    expect(links[1].text).toBe("link here");
  });

  it("detects internal links by path prefix", () => {
    const links = extractLinks(blocks);
    expect(links[0].internal).toBe(false);
    expect(links[1].internal).toBe(true);
  });

  it("detects internal links by site URL", () => {
    const links = extractLinks(blocks, "https://example.com");
    expect(links[0].internal).toBe(true);
    expect(links[1].internal).toBe(true);
  });

  it("handles blocks without markDefs", () => {
    const links = extractLinks([
      { _type: "block", style: "normal", children: [{ _type: "span", text: "no links" }] },
    ]);
    expect(links).toHaveLength(0);
  });
});
