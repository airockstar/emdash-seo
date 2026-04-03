import { formatSocialPost } from "./format.js";
import type { PostResult } from "./types.js";

export interface BlueskyConfig {
  handle: string;
  appPassword: string;
}

export async function postToBluesky(
  http: { fetch(url: string, init?: RequestInit): Promise<Response> },
  config: BlueskyConfig,
  content: { title?: string; url?: string; description?: string },
  template: string,
): Promise<PostResult> {
  const text = formatSocialPost(template, content);

  try {
    // Authenticate with Bluesky AT Protocol
    const authResponse = await http.fetch(
      "https://bsky.social/xrpc/com.atproto.server.createSession",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: config.handle,
          password: config.appPassword,
        }),
      },
    );

    if (!authResponse.ok) {
      return { success: false, platform: "bluesky", error: `Bluesky auth failed: ${authResponse.status}` };
    }

    const session = await authResponse.json() as { did: string; accessJwt: string };

    // Create post
    const postResponse = await http.fetch(
      "https://bsky.social/xrpc/com.atproto.repo.createRecord",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessJwt}`,
        },
        body: JSON.stringify({
          repo: session.did,
          collection: "app.bsky.feed.post",
          record: {
            text,
            createdAt: new Date().toISOString(),
          },
        }),
      },
    );

    if (!postResponse.ok) {
      const body = await postResponse.text();
      return { success: false, platform: "bluesky", error: `Bluesky post failed: ${postResponse.status} ${body}` };
    }

    const postData = await postResponse.json() as { uri?: string };
    return { success: true, platform: "bluesky", postId: postData.uri };
  } catch (e: any) {
    return { success: false, platform: "bluesky", error: e.message ?? "Unknown error" };
  }
}
