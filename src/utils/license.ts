import { verifyJwt } from "./jwt.js";

export type LicenseTier = "free" | "pro" | "agency";

export interface LicenseInfo {
  tier: LicenseTier;
  valid: boolean;
  expiresAt: string | null;
  siteLimit: number;
}

const FEATURE_TIERS: Record<string, LicenseTier> = {
  "meta-tags": "free",
  sitemap: "free",
  "robots-txt": "free",
  "basic-analysis": "free",
  verification: "free",
  "analytics-injection": "free",
  "advanced-analysis": "pro",
  readability: "pro",
  "bulk-editing": "pro",
  "social-auto-post": "pro",
  "internal-link-suggestions": "pro",
  "multi-site": "agency",
  "white-label": "agency",
};

const TIER_LEVEL: Record<LicenseTier, number> = {
  free: 0,
  pro: 1,
  agency: 2,
};

const FREE: LicenseInfo = { tier: "free", valid: false, expiresAt: null, siteLimit: 1 };

/**
 * Validate a license key (JWT RS256 format only).
 * License keys are signed JWTs with payload: { tier, exp, sub }
 */
export async function validateLicense(key: string): Promise<LicenseInfo> {
  if (!key) return FREE;

  const payload = await verifyJwt(key);
  if (!payload) return FREE;

  const tier = payload.tier as LicenseTier;
  if (!tier || !(tier in TIER_LEVEL)) return FREE;

  let expiresAt: string | null = null;
  if (payload.exp) {
    const expiryDate = new Date(payload.exp * 1000);
    expiresAt = expiryDate.toISOString();

    // 7-day grace period
    const grace = new Date(expiryDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (new Date() > grace) {
      return { tier: "free", valid: false, expiresAt, siteLimit: 1 };
    }
  }

  return {
    tier,
    valid: true,
    expiresAt,
    siteLimit: tier === "agency" ? 999 : 1,
  };
}

export async function checkLicenseStatus(ctx: {
  kv: { get(key: string): Promise<unknown> };
}): Promise<LicenseInfo> {
  const key = (await ctx.kv.get("settings:licenseKey")) as string | null;
  if (!key) return FREE;
  return validateLicense(key);
}

export function isFeatureAllowed(feature: string, tier: LicenseTier): boolean {
  const requiredTier = FEATURE_TIERS[feature];
  if (!requiredTier) return false;
  return TIER_LEVEL[tier] >= TIER_LEVEL[requiredTier];
}
