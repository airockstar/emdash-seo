import { describe, it, expect, vi } from "vitest";
import { pingIndexNow } from "../../src/utils/indexnow.js";

function mockHttp(status: number) {
  return {
    fetch: vi.fn(async () => ({ ok: status >= 200 && status < 300, status }) as Response),
  };
}

describe("pingIndexNow", () => {
  it("returns success on 200", async () => {
    const http = mockHttp(200);
    const result = await pingIndexNow(http, "https://example.com/page", "my-key", "example.com");

    expect(result.success).toBe(true);
    expect(http.fetch).toHaveBeenCalledWith("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/page", key: "my-key", host: "example.com" }),
    });
  });

  it("returns success on 202", async () => {
    const http = mockHttp(202);
    const result = await pingIndexNow(http, "https://example.com/page", "my-key", "example.com");

    expect(result.success).toBe(true);
  });

  it("returns failure on 400", async () => {
    const http = mockHttp(400);
    const result = await pingIndexNow(http, "https://example.com/page", "my-key", "example.com");

    expect(result.success).toBe(false);
    expect(result.error).toContain("400");
  });

  it("returns failure on network error", async () => {
    const http = { fetch: vi.fn(async () => { throw new Error("Network error"); }) };
    const result = await pingIndexNow(http, "https://example.com/page", "my-key", "example.com");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network error");
  });
});
