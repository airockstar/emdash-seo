import { apiFetch as baseFetch, getErrorMessage } from "emdash/plugin-utils";

const API = "/_emdash/api/plugins/emdash-seo";

export async function apiFetch(route: string, body?: unknown): Promise<any> {
  const res = await baseFetch(`${API}/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, `Request failed: ${res.statusText}`));
  }

  const json = await res.json() as any;
  return json.data ?? json;
}
