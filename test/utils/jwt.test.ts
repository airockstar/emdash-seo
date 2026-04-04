import { describe, it, expect } from "vitest";
import { verifyJwt, decodeJwtUnsafe } from "../../src/utils/jwt.js";

// Helper to create a base64url-encoded string
function base64url(obj: Record<string, unknown>): string {
  const json = JSON.stringify(obj);
  const b64 = btoa(json);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Build a fake JWT (header.payload.signature) - not cryptographically valid
function fakeJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
): string {
  return `${base64url(header)}.${base64url(payload)}.fakesignature`;
}

describe("verifyJwt", () => {
  it("returns null for non-JWT strings", async () => {
    const result = await verifyJwt("not-a-jwt");
    expect(result).toBeNull();
  });

  it("returns null for malformed JWT (wrong number of parts)", async () => {
    const result = await verifyJwt("part1.part2");
    expect(result).toBeNull();
  });

  it("returns null for non-RS256 algorithm", async () => {
    const token = fakeJwt({ alg: "HS256", typ: "JWT" }, { tier: "pro" });
    const result = await verifyJwt(token);
    expect(result).toBeNull();
  });
});

describe("decodeJwtUnsafe", () => {
  it("decodes a valid JWT payload", () => {
    const payload = { tier: "pro", sub: "user-1", exp: 9999999999 };
    const token = fakeJwt({ alg: "RS256", typ: "JWT" }, payload);
    const result = decodeJwtUnsafe(token);

    expect(result).toEqual(payload);
  });

  it("returns null for invalid base64", () => {
    const result = decodeJwtUnsafe("valid.!!!invalid-base64!!!.sig");
    expect(result).toBeNull();
  });
});

describe("base64url decode", () => {
  it("handles padding correctly via decodeJwtUnsafe", () => {
    // A payload whose base64url encoding requires padding
    const payload = { tier: "free", iat: 1000000000 };
    const token = fakeJwt({ alg: "RS256", typ: "JWT" }, payload);
    const result = decodeJwtUnsafe(token);

    expect(result).toEqual(payload);
  });
});
