import { describe, it, expect, vi } from "vitest";
import { checkOgImage } from "../../src/analysis/og-image.js";

function createMockMedia(items: Record<string, { width?: number; height?: number }> = {}) {
  return {
    get: vi.fn(async (id: string) => items[id] ?? null),
  };
}

describe("checkOgImage", () => {
  it("warns when no OG image is set", async () => {
    const result = await checkOgImage(undefined);
    expect(result.status).toBe("warn");
    expect(result.message).toContain("No OG image set");
  });

  it("passes for external URL without media ctx", async () => {
    const result = await checkOgImage("https://external.com/img.jpg");
    expect(result.status).toBe("pass");
  });

  it("passes for external URL with media ctx", async () => {
    const media = createMockMedia();
    const result = await checkOgImage("https://external.com/img.jpg", media);
    expect(result.status).toBe("pass");
    expect(result.message).toContain("external URL");
  });

  it("fails when media asset not found", async () => {
    const media = createMockMedia();
    const result = await checkOgImage("https://example.com/media/nonexistent", media);
    expect(result.status).toBe("fail");
    expect(result.message).toContain("not found");
  });

  it("passes for image with good dimensions", async () => {
    const media = createMockMedia({ "img123": { width: 1200, height: 630 } });
    const result = await checkOgImage("https://example.com/media/img123", media);
    expect(result.status).toBe("pass");
    expect(result.message).toContain("1200x630");
  });

  it("warns for small image dimensions", async () => {
    const media = createMockMedia({ "img456": { width: 400, height: 300 } });
    const result = await checkOgImage("https://example.com/media/img456", media);
    expect(result.status).toBe("warn");
    expect(result.message).toContain("small");
  });

  it("passes when media exists but has no dimensions", async () => {
    const media = createMockMedia({ "img789": {} });
    const result = await checkOgImage("https://example.com/media/img789", media);
    expect(result.status).toBe("pass");
    expect(result.message).toContain("exists");
  });

  it("extracts media ID from various URL patterns", async () => {
    const media = createMockMedia({ "abc123": { width: 1200, height: 630 } });

    const r1 = await checkOgImage("https://example.com/media/abc123", media);
    expect(r1.status).toBe("pass");

    const r2 = await checkOgImage("https://example.com/_media/abc123.jpg", media);
    expect(r2.status).toBe("pass");

    const r3 = await checkOgImage("https://example.com/uploads/abc123", media);
    expect(r3.status).toBe("pass");
  });

  it("gracefully handles media.get errors", async () => {
    const media = { get: vi.fn(async () => { throw new Error("Network error"); }) };
    const result = await checkOgImage("https://example.com/media/test", media);
    expect(result.status).toBe("pass");
  });
});
