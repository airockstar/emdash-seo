export interface SearchAnalytics {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Fetch search analytics data from Google Search Console API.
 */
export async function fetchSearchAnalytics(
  http: { fetch(url: string, init?: RequestInit): Promise<Response> },
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
): Promise<SearchAnalytics[]> {
  const encodedSite = encodeURIComponent(siteUrl);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

  const response = await http.fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: 100,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GSC API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    rows?: Array<{
      keys: string[];
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
  };

  return (data.rows ?? []).map((row) => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}
