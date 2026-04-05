import { describe, it, expect, vi } from "vitest";
import { fetchSearchAnalytics } from "../../src/utils/gsc.js";

function mockHttp(responseBody: unknown, status = 200) {
  return {
    fetch: vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => responseBody,
      text: async () => JSON.stringify(responseBody),
    })) as any,
  };
}

describe("fetchSearchAnalytics", () => {
  it("returns parsed search analytics rows", async () => {
    const http = mockHttp({
      rows: [
        { keys: ["seo plugin"], clicks: 50, impressions: 1000, ctr: 0.05, position: 3.2 },
        { keys: ["emdash cms"], clicks: 20, impressions: 500, ctr: 0.04, position: 5.1 },
      ],
    });

    const result = await fetchSearchAnalytics(http, "token-123", "https://example.com", "2024-01-01", "2024-01-31");

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      query: "seo plugin",
      clicks: 50,
      impressions: 1000,
      ctr: 0.05,
      position: 3.2,
    });
    expect(result[1].query).toBe("emdash cms");
  });

  it("sends correct API request", async () => {
    const http = mockHttp({ rows: [] });
    await fetchSearchAnalytics(http, "my-token", "https://example.com", "2024-01-01", "2024-01-31");

    expect(http.fetch).toHaveBeenCalledWith(
      "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fexample.com/searchAnalytics/query",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer my-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          dimensions: ["query"],
          rowLimit: 100,
        }),
      },
    );
  });

  it("returns empty array when no rows", async () => {
    const http = mockHttp({});
    const result = await fetchSearchAnalytics(http, "token", "https://example.com", "2024-01-01", "2024-01-31");
    expect(result).toEqual([]);
  });

  it("throws on non-ok response", async () => {
    const http = mockHttp({}, 401);
    await expect(
      fetchSearchAnalytics(http, "bad-token", "https://example.com", "2024-01-01", "2024-01-31"),
    ).rejects.toThrow("GSC API error 401:");
  });
});
