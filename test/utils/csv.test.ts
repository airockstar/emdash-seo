import { describe, it, expect } from "vitest";
import { overridesToCsv, csvToOverrides } from "../../src/utils/csv.js";

describe("overridesToCsv", () => {
  it("produces header and rows", () => {
    const csv = overridesToCsv([
      { id: "post-1", data: { collection: "posts", title: "Hello World", description: "A desc" } },
    ]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("contentId,collection,title,description,ogImage,robots,canonical,focusKeyword,schemaType,breadcrumbLabel");
    expect(lines[1]).toContain("post-1");
    expect(lines[1]).toContain("Hello World");
  });

  it("escapes commas and quotes", () => {
    const csv = overridesToCsv([
      { id: "p-1", data: { title: 'A "title" here', description: "one, two, three" } },
    ]);
    expect(csv).toContain('"A ""title"" here"');
    expect(csv).toContain('"one, two, three"');
  });

  it("handles empty items", () => {
    const csv = overridesToCsv([]);
    const lines = csv.split("\n");
    expect(lines.length).toBe(1); // header only
  });
});

describe("csvToOverrides", () => {
  it("parses valid CSV", () => {
    const csv = "contentId,collection,title\npost-1,posts,My Title\npost-2,pages,Other";
    const result = csvToOverrides(csv);
    expect(result.length).toBe(2);
    expect(result[0].contentId).toBe("post-1");
    expect(result[0].title).toBe("My Title");
    expect(result[1].contentId).toBe("post-2");
  });

  it("handles quoted fields", () => {
    const csv = 'contentId,title\npost-1,"A ""quoted"" title"';
    const result = csvToOverrides(csv);
    expect(result[0].title).toBe('A "quoted" title');
  });

  it("skips rows without contentId", () => {
    const csv = "contentId,title\n,Just Title\npost-1,Valid";
    const result = csvToOverrides(csv);
    expect(result.length).toBe(1);
    expect(result[0].contentId).toBe("post-1");
  });

  it("returns empty for header-only CSV", () => {
    const csv = "contentId,title";
    const result = csvToOverrides(csv);
    expect(result.length).toBe(0);
  });

  it("roundtrips with overridesToCsv", () => {
    const original = [
      { id: "p-1", data: { collection: "posts", title: "Title 1", description: "Desc 1", robots: "index, follow" } },
      { id: "p-2", data: { collection: "pages", title: "Title 2", focusKeyword: "seo" } },
    ];
    const csv = overridesToCsv(original);
    const parsed = csvToOverrides(csv);
    expect(parsed.length).toBe(2);
    expect(parsed[0].contentId).toBe("p-1");
    expect(parsed[0].title).toBe("Title 1");
    expect(parsed[1].focusKeyword).toBe("seo");
  });
});
