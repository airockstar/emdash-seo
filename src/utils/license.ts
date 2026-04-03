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
  "multi-site": "agency",
  "white-label": "agency",
};

const TIER_LEVEL: Record<LicenseTier, number> = {
  free: 0,
  pro: 1,
  agency: 2,
};

/**
 * Decode and validate a license key.
 * License keys are base64-encoded JSON: { tier, exp, sub }
 * In production, these would be signed JWTs verified with a public key.
 * For MVP, we use simple base64 encoding with expiry check.
 */
export function validateLicense(key: string): LicenseInfo {
  const FREE: LicenseInfo = { tier: "free", valid: false, expiresAt: null, siteLimit: 1 };

  if (!key) return FREE;

  try {
    const decoded = JSON.parse(atob(key));
    const tier = decoded.tier as LicenseTier;
    // TODO: Replace with signed JWT verification before production launch
    if (!tier || !(tier in TIER_LEVEL)) return FREE;

    const expiresAt = decoded.exp ? new Date(decoded.exp).toISOString() : null;

    // Check expiry (with 7-day grace period)
    if (decoded.exp) {
      const expiry = new Date(decoded.exp);
      const grace = new Date(expiry.getTime() + 7 * 24 * 60 * 60 * 1000);
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
  } catch {
    return FREE;
  }
}

export async function checkLicenseStatus(ctx: {
  kv: { get(key: string): Promise<unknown> };
}): Promise<LicenseInfo> {
  const key = (await ctx.kv.get("settings:licenseKey")) as string | null;
  if (!key) {
    return { tier: "free", valid: false, expiresAt: null, siteLimit: 1 };
  }
  return validateLicense(key);
}

export function isFeatureAllowed(feature: string, tier: LicenseTier): boolean {
  const requiredTier = FEATURE_TIERS[feature];
  if (!requiredTier) return false;
  return TIER_LEVEL[tier] >= TIER_LEVEL[requiredTier];
}
