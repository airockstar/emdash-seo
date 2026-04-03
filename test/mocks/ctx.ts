import { vi } from "vitest";
import type { SeoOverrides, SeoScore } from "../../src/types.js";

function createMockCollection<T extends Record<string, unknown>>(
  initial: Record<string, T> = {},
) {
  const store = new Map<string, T>(Object.entries(initial));

  return {
    get: vi.fn(async (id: string) => store.get(id) ?? null),
    put: vi.fn(async (id: string, data: T) => {
      store.set(id, data);
    }),
    delete: vi.fn(async (id: string) => {
      return store.delete(id);
    }),
    exists: vi.fn(async (id: string) => store.has(id)),
    count: vi.fn(async () => store.size),
    getMany: vi.fn(async (ids: string[]) => {
      const result = new Map<string, T>();
      for (const id of ids) {
        const val = store.get(id);
        if (val) result.set(id, val);
      }
      return result;
    }),
    putMany: vi.fn(async (entries: Array<{ id: string; data: T }>) => {
      for (const { id, data } of entries) store.set(id, data);
    }),
    deleteMany: vi.fn(async (ids: string[]) => {
      let count = 0;
      for (const id of ids) {
        if (store.delete(id)) count++;
      }
      return count;
    }),
    query: vi.fn(async (opts?: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, "asc" | "desc">;
      limit?: number;
      cursor?: string;
    }) => {
      let items = [...store.entries()].map(([id, data]) => ({ id, data }));

      if (opts?.where) {
        for (const [key, value] of Object.entries(opts.where)) {
          if (typeof value === "string" || typeof value === "number") {
            items = items.filter(
              (item) => (item.data as Record<string, unknown>)[key] === value,
            );
          }
        }
      }

      const limit = opts?.limit ?? 50;
      return { items: items.slice(0, limit), nextCursor: undefined };
    }),
    _store: store,
  };
}

export interface MockContentItem {
  id: string;
  collection: string;
  slug: string;
  title?: string;
  status?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface MockCtxOptions {
  settings?: Record<string, unknown>;
  overrides?: Record<string, SeoOverrides>;
  scores?: Record<string, SeoScore>;
  contentItems?: MockContentItem[];
  site?: Partial<{ name: string; url: string; locale: string }>;
}

export function createMockCtx(options: MockCtxOptions = {}) {
  const kvStore = new Map<string, unknown>();

  for (const [key, value] of Object.entries(options.settings ?? {})) {
    kvStore.set(`settings:${key}`, value);
  }

  return {
    kv: {
      get: vi.fn(async <T>(key: string) => (kvStore.get(key) as T) ?? null),
      set: vi.fn(async (key: string, value: unknown) => {
        kvStore.set(key, value);
      }),
      delete: vi.fn(async (key: string) => kvStore.delete(key)),
      list: vi.fn(async (prefix?: string) =>
        [...kvStore.entries()]
          .filter(([k]) => !prefix || k.startsWith(prefix))
          .map(([key, value]) => ({ key, value })),
      ),
    },
    storage: {
      overrides: createMockCollection(options.overrides ?? {}),
      scores: createMockCollection(options.scores ?? {}),
    },
    log: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    site: {
      name: "Test Site",
      url: "https://example.com",
      locale: "en",
      ...options.site,
    },
    url: (path: string) => `https://example.com${path}`,
    content: {
      get: vi.fn(async (id: string) =>
        (options.contentItems ?? []).find((c) => c.id === id) ?? null,
      ),
      list: vi.fn(async () => ({
        items: (options.contentItems ?? []).map((c) => ({ id: c.id, data: c })),
        nextCursor: undefined,
      })),
    },
    plugin: { id: "@emdash-seo/toolkit", version: "0.1.0" },
    cron: {
      schedule: vi.fn(),
      cancel: vi.fn(),
      list: vi.fn(async () => []),
    },
  };
}
