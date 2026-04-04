import { describe, it, expect, vi } from "vitest";
import { postToBluesky } from "../../../src/utils/social/bluesky.js";

function mockHttp() {
  return { fetch: vi.fn() };
}

const config = { handle: "user.bsky.social", appPassword: "app-password" };
const content = {
  title: "Test Post",
  url: "https://example.com/test",
  description: "A test post",
};
const template = "New: {title} — {url}";

describe("postToBluesky", () => {
  it("returns success on successful auth + post", async () => {
    const http = mockHttp();
    http.fetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ did: "did:plc:abc", accessJwt: "jwt-tok" }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ uri: "at://did:plc:abc/app.bsky.feed.post/123" }),
          { status: 200 },
        ),
      );

    const result = await postToBluesky(http, config, content, template);

    expect(result.success).toBe(true);
    expect(result.platform).toBe("bluesky");
    expect(result.postId).toBe("at://did:plc:abc/app.bsky.feed.post/123");
  });

  it("returns failure on auth error", async () => {
    const http = mockHttp();
    http.fetch.mockResolvedValueOnce(
      new Response("Invalid credentials", { status: 401 }),
    );

    const result = await postToBluesky(http, config, content, template);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Bluesky auth failed");
  });

  it("returns failure on post error", async () => {
    const http = mockHttp();
    http.fetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ did: "did:plc:abc", accessJwt: "jwt-tok" }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response("Server error", { status: 500 }),
      );

    const result = await postToBluesky(http, config, content, template);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Bluesky post failed");
  });

  it("creates session before posting", async () => {
    const http = mockHttp();
    http.fetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ did: "did:plc:abc", accessJwt: "jwt-tok" }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ uri: "at://post/1" }), { status: 200 }),
      );

    await postToBluesky(http, config, content, template);

    // First call should be auth
    const authCall = http.fetch.mock.calls[0];
    expect(authCall[0]).toBe(
      "https://bsky.social/xrpc/com.atproto.server.createSession",
    );
    const authBody = JSON.parse(authCall[1].body);
    expect(authBody.identifier).toBe(config.handle);
    expect(authBody.password).toBe(config.appPassword);

    // Second call should be createRecord with bearer token
    const postCall = http.fetch.mock.calls[1];
    expect(postCall[0]).toBe(
      "https://bsky.social/xrpc/com.atproto.repo.createRecord",
    );
    expect(postCall[1].headers.Authorization).toBe("Bearer jwt-tok");
  });

  it("formats post text from template", async () => {
    const http = mockHttp();
    http.fetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ did: "did:plc:abc", accessJwt: "jwt-tok" }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ uri: "at://post/1" }), { status: 200 }),
      );

    await postToBluesky(http, config, content, template);

    const postCall = http.fetch.mock.calls[1];
    const body = JSON.parse(postCall[1].body);
    expect(body.record.text).toBe(
      "New: Test Post — https://example.com/test",
    );
  });
});
