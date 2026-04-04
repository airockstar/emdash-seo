export interface JwtPayload {
  tier: string;
  exp?: number;
  sub?: string;
  iss?: string;
  iat?: number;
}

// Base64url decode (JWT uses base64url, not standard base64)
function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64urlDecodeString(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
}

/** RSA public key for license JWT verification. */
const PUBLIC_KEY_JWK: JsonWebKey = {
  kty: "RSA",
  n: "nsukrmIGf-a469JjrgU8aDc8vlVy1dbvSJpIqvQSMNFWmkNVPN_R2P64O5KNXFw6bnjoEWsqYVL_HjJOkQxnptuBuNt-qE8BYNQbmGB-cUdrk_5ZVfB2ZZm6zeAIjKXMUWV2P9b9Cel0biBhrAqf6ZBfJx9vBj28lda63385L6GQhg7XuGJ6mnej9WVDVQfByBLUzsE2WO2y9F0ZlcQhExHxB12tr3521_NW-04yqXlqsk4h9ecwWlN0oYFZeoYZyrb4hibTEkc6csL3hWCWe5HfrauVo9iJKd46zQBAKpHA0eMYuFuiyjP8OqJuvbmf5iLXrFbLhTcBrM4ngC1PyQ",
  e: "AQAB",
  alg: "RS256",
  use: "sig",
};

let cachedKey: CryptoKey | null = null;

async function getPublicKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "jwk",
    PUBLIC_KEY_JWK,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return cachedKey;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify header
    const header = JSON.parse(base64urlDecodeString(headerB64));
    if (header.alg !== "RS256") return null;

    // Import public key and verify signature
    const key = await getPublicKey();
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64urlDecode(signatureB64);

    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      signature.buffer as ArrayBuffer,
      data.buffer as ArrayBuffer,
    );

    if (!valid) return null;

    // Decode and return payload
    const payload = JSON.parse(base64urlDecodeString(payloadB64)) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Verify a JWT without cryptographic signature check.
 * Used for development/testing when no real keypair is configured.
 */
export function decodeJwtUnsafe(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    return JSON.parse(base64urlDecodeString(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}
