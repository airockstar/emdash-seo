import { formatSocialPost } from "./format.js";
import type { PostResult } from "./types.js";

export interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
}

export async function postToTwitter(
  http: { fetch(url: string, init?: RequestInit): Promise<Response> },
  config: TwitterConfig,
  content: { title?: string; url?: string; description?: string },
  template: string,
): Promise<PostResult> {
  const text = formatSocialPost(template, content);

  try {
    // OAuth 2.0 client credentials flow to obtain bearer token
    const credentials = btoa(`${config.apiKey}:${config.apiSecret}`);
    const tokenResponse = await http.fetch("https://api.twitter.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      return { success: false, platform: "twitter", error: `Twitter auth failed: ${tokenResponse.status}` };
    }

    const tokenData = await tokenResponse.json() as { access_token: string };

    const response = await http.fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { success: false, platform: "twitter", error: `Twitter API error: ${response.status} ${body}` };
    }

    const data = await response.json() as { data?: { id?: string } };
    return { success: true, platform: "twitter", postId: data.data?.id };
  } catch (e: any) {
    return { success: false, platform: "twitter", error: e.message ?? "Unknown error" };
  }
}
