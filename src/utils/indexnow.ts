export async function pingIndexNow(
  http: { fetch(url: string, init?: RequestInit): Promise<Response> },
  pageUrl: string,
  apiKey: string,
  host: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await http.fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: pageUrl, key: apiKey, host }),
    });
    if (response.ok || response.status === 202) {
      return { success: true };
    }
    return { success: false, error: `IndexNow returned status ${response.status}` };
  } catch (e: any) {
    return { success: false, error: e.message ?? "IndexNow request failed" };
  }
}
