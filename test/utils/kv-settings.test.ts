import { describe, it, expect, vi } from "vitest";
import {
  getSeoDefaults,
  getAnalyticsSettings,
  getVerificationSettings,
  getCustomScriptsSettings,
  rebuildCompositeKeys,
} from "../../src/utils/kv-settings.js";

function createMockKv(data: Record<string, unknown> = {}) {
  const store = new Map(Object.entries(data));
  return {
    get: vi.fn(async <T>(key: string) => (store.get(key) as T) ?? null),
    set: vi.fn(async (key: string, value: unknown) => { store.set(key, value); }),
    _store: store,
  };
}

describe("getSeoDefaults", () => {
  it("returns composite key when available", async () => {
    const composite = { siteName: "Test", titleTemplate: "{title} | {site}", titleSeparator: "|", defaultOgImage: "", twitterHandle: "", orgName: "", orgLogoUrl: "", defaultRobots: "index, follow" };
    const kv = createMockKv({ "settings:seoDefaults": composite });

    const result = await getSeoDefaults(kv);

    expect(result.siteName).toBe("Test");
    expect(kv.get).toHaveBeenCalledTimes(1);
  });

  it("falls back to individual keys when composite is null", async () => {
    const kv = createMockKv({
      "settings:siteName": "Fallback Site",
      "settings:titleTemplate": "{title} - {site}",
    });

    const result = await getSeoDefaults(kv);

    expect(result.siteName).toBe("Fallback Site");
    expect(result.titleTemplate).toBe("{title} - {site}");
    // 1 composite attempt + 8 individual reads = 9
    expect(kv.get).toHaveBeenCalledTimes(9);
  });

  it("returns empty strings for missing individual keys", async () => {
    const kv = createMockKv({});

    const result = await getSeoDefaults(kv);

    expect(result.siteName).toBe("");
    expect(result.defaultRobots).toBe("");
  });
});

describe("getAnalyticsSettings", () => {
  it("returns composite when available", async () => {
    const composite = { googleAnalyticsId: "G-TEST", gtmContainerId: "", cfAnalyticsToken: "", facebookPixelId: "" };
    const kv = createMockKv({ "settings:analytics": composite });

    const result = await getAnalyticsSettings(kv);
    expect(result.googleAnalyticsId).toBe("G-TEST");
    expect(kv.get).toHaveBeenCalledTimes(1);
  });

  it("falls back to individual keys", async () => {
    const kv = createMockKv({ "settings:googleAnalyticsId": "G-FALLBACK" });

    const result = await getAnalyticsSettings(kv);
    expect(result.googleAnalyticsId).toBe("G-FALLBACK");
  });
});

describe("getVerificationSettings", () => {
  it("returns composite when available", async () => {
    const kv = createMockKv({
      "settings:verification": { googleVerification: "gv", bingVerification: "bv", pinterestVerification: "", yandexVerification: "" },
    });
    const result = await getVerificationSettings(kv);
    expect(result.googleVerification).toBe("gv");
  });
});

describe("getCustomScriptsSettings", () => {
  it("returns composite when available", async () => {
    const kv = createMockKv({
      "settings:customScripts": { customHeadScripts: "<script>head</script>", customBodyScripts: "" },
    });
    const result = await getCustomScriptsSettings(kv);
    expect(result.customHeadScripts).toBe("<script>head</script>");
  });
});

describe("rebuildCompositeKeys", () => {
  it("reads individual keys and writes composite objects", async () => {
    const kv = createMockKv({
      "settings:siteName": "Rebuild Test",
      "settings:googleAnalyticsId": "G-REBUILD",
    });

    await rebuildCompositeKeys(kv);

    expect(kv.set).toHaveBeenCalledWith("settings:seoDefaults", expect.objectContaining({ siteName: "Rebuild Test" }));
    expect(kv.set).toHaveBeenCalledWith("settings:analytics", expect.objectContaining({ googleAnalyticsId: "G-REBUILD" }));
    expect(kv.set).toHaveBeenCalledWith("settings:verification", expect.any(Object));
    expect(kv.set).toHaveBeenCalledWith("settings:customScripts", expect.any(Object));
  });

  it("is idempotent — calling twice produces same result", async () => {
    const kv = createMockKv({ "settings:siteName": "Idem" });

    await rebuildCompositeKeys(kv);
    await rebuildCompositeKeys(kv);

    // Second call reads composite (which was set by first call)
    const result = await getSeoDefaults(kv);
    expect(result.siteName).toBe("Idem");
  });
});
