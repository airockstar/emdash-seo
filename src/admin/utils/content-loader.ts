export interface ContentItem {
  id: string;
  title: string;
  collection: string;
}

export async function loadAllContent(): Promise<ContentItem[]> {
  try {
    const manifestRes = await fetch("/_emdash/api/manifest");
    if (!manifestRes.ok) return [];
    const manifest = (await manifestRes.json()) as {
      data?: { collections?: Record<string, unknown> };
    };
    const collections = Object.keys(manifest.data?.collections ?? {});
    if (collections.length === 0) return [];

    const results = await Promise.all(
      collections.map(async (col) => {
        try {
          const res = await fetch(`/_emdash/api/content/${col}`);
          if (!res.ok) return [];
          const json = (await res.json()) as {
            data?: {
              items?: Array<{ id: string; data?: Record<string, unknown> }>;
            };
          };
          return (json.data?.items ?? []).map((item) => ({
            id: item.id,
            title: (item.data?.title as string) ?? item.id,
            collection: col,
          }));
        } catch {
          return [];
        }
      }),
    );
    return results.flat();
  } catch {
    return [];
  }
}
