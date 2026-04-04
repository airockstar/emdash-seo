export interface SeoDefaultsSettings {
  siteName: string;
  titleTemplate: string;
  titleSeparator: string;
  defaultOgImage: string;
  twitterHandle: string;
  orgName: string;
  orgLogoUrl: string;
  defaultRobots: string;
}

export interface AnalyticsSettings {
  googleAnalyticsId: string;
  gtmContainerId: string;
  cfAnalyticsToken: string;
  facebookPixelId: string;
}

export interface VerificationSettings {
  googleVerification: string;
  bingVerification: string;
  pinterestVerification: string;
  yandexVerification: string;
}

export interface CustomScriptsSettings {
  customHeadScripts: string;
  customBodyScripts: string;
}

interface KV {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
}

const SEO_DEFAULTS_KEYS: Array<keyof SeoDefaultsSettings> = [
  "siteName", "titleTemplate", "titleSeparator", "defaultOgImage",
  "twitterHandle", "orgName", "orgLogoUrl", "defaultRobots",
];

const ANALYTICS_KEYS: Array<keyof AnalyticsSettings> = [
  "googleAnalyticsId", "gtmContainerId", "cfAnalyticsToken", "facebookPixelId",
];

const VERIFICATION_KEYS: Array<keyof VerificationSettings> = [
  "googleVerification", "bingVerification", "pinterestVerification", "yandexVerification",
];

const CUSTOM_SCRIPTS_KEYS: Array<keyof CustomScriptsSettings> = [
  "customHeadScripts", "customBodyScripts",
];

async function getCompositeOrFallback<T>(
  kv: KV,
  compositeKey: string,
  individualKeys: Array<keyof T>,
): Promise<T> {
  const composite = await kv.get<T>(compositeKey);
  if (composite) {
    // Ensure all expected keys present (handles schema evolution)
    const result = {} as Record<string, string>;
    for (const key of individualKeys) {
      result[String(key)] = (composite as Record<string, string>)[String(key)] ?? "";
    }
    return result as T;
  }

  const values = await Promise.all(
    individualKeys.map((key) => kv.get<string>(`settings:${String(key)}`)),
  );

  const result = {} as Record<string, string>;
  for (let i = 0; i < individualKeys.length; i++) {
    result[String(individualKeys[i])] = values[i] ?? "";
  }
  return result as T;
}

export function getSeoDefaults(kv: KV): Promise<SeoDefaultsSettings> {
  return getCompositeOrFallback<SeoDefaultsSettings>(kv, "settings:seoDefaults", SEO_DEFAULTS_KEYS);
}

export function getAnalyticsSettings(kv: KV): Promise<AnalyticsSettings> {
  return getCompositeOrFallback<AnalyticsSettings>(kv, "settings:analytics", ANALYTICS_KEYS);
}

export function getVerificationSettings(kv: KV): Promise<VerificationSettings> {
  return getCompositeOrFallback<VerificationSettings>(kv, "settings:verification", VERIFICATION_KEYS);
}

export function getCustomScriptsSettings(kv: KV): Promise<CustomScriptsSettings> {
  return getCompositeOrFallback<CustomScriptsSettings>(kv, "settings:customScripts", CUSTOM_SCRIPTS_KEYS);
}

export async function rebuildCompositeKeys(kv: KV): Promise<void> {
  const [seo, analytics, verification, scripts] = await Promise.all([
    getSeoDefaults(kv),
    getAnalyticsSettings(kv),
    getVerificationSettings(kv),
    getCustomScriptsSettings(kv),
  ]);

  await Promise.all([
    kv.set("settings:seoDefaults", seo),
    kv.set("settings:analytics", analytics),
    kv.set("settings:verification", verification),
    kv.set("settings:customScripts", scripts),
  ]);
}
