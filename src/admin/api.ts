import { apiFetch as baseFetch } from "emdash/plugin-utils";

const API = "/_emdash/api/plugins/@emdash-seo/toolkit";

export function apiFetch(route: string, body?: unknown): Promise<Response> {
  return baseFetch(`${API}/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}
