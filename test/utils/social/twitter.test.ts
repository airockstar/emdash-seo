import { describe, it, expect, vi } from "vitest";
import { postToTwitter } from "../../../src/utils/social/twitter.js";

function mockHttp() {
  return { fetch: vi.fn() };
}

const config = { apiKey: "test-key", apiSecret: "test-secret" };
const content = {
  title: "Test Post",
  url: "https://example.com/test",
  description: "A test post",
};
const template = "New: {title} — {url}";

describe("postToTwitter", () => {
  it("returns success result on successful post", async () => {
    const http = mockHttp();
    http.fetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "bearer-tok" }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: "tweet-123" } }), {
          status: 200,
        }),
      );

    const result = await postToTwitter(http, config, content, template);

    expect(result.success).toBe(true);
    expect(result.platform).toBe("twitter");
    expect(result.postId).toBe("tweet-123");
  });

  it("returns failure on auth error", async () => {
    const http = mockHttp();
    http.fetch.mockResolvedValueOnce(
      new Response("Unauthorized", { status: 401 }),
    );

    const result = await postToTwitter(http, config, content, template);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Twitter auth failed");
  });

  it("returns failure on post error", async () => {
    const http = mockHttp();
    http.fetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "tok" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response("Rate limited", { status: 429 }),
      );

    const result = await postToTwitter(http, config, content, template);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Twitter API error");
  });

  it("sends correct OAuth credentials", async () => {
    const http = mockHttp();
    http.fetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "tok" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: "1" } }), { status: 200 }),
      );

    await postToTwitter(http, config, content, template);

    const authCall = http.fetch.mock.calls[0];
    expect(authCall[0]).toBe("https://api.twitter.com/oauth2/token");
    const expectedCreds = btoa(`${config.apiKey}:${config.apiSecret}`);
    expect(authCall[1].headers.Authorization).toBe(`Basic ${expectedCreds}`);
  });

  it("formats post text from template", async () => {
    const http = mockHttp();
    http.fetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "tok" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: "1" } }), { status: 200 }),
      );

    await postToTwitter(http, config, content, template);

    const postCall = http.fetch.mock.calls[1];
    const body = JSON.parse(postCall[1].body);
    expect(body.text).toBe("New: Test Post — https://example.com/test");
  });
});
