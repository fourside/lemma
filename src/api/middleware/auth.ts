import { createMiddleware } from "hono/factory";
import type { Env } from "../index";

interface JwtPayload {
  sub: number;
  iat: number;
  exp: number;
}

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = header.slice(7);
  try {
    const payload = await verifyJwt(token, c.env.JWT_SECRET);
    c.set("userId", payload.sub);

    // Sliding expiration: refresh if within 7 days of expiry
    const now = Math.floor(Date.now() / 1000);
    const sevenDays = 7 * 24 * 60 * 60;
    if (payload.exp - now < sevenDays) {
      const newToken = await signJwt(payload.sub, c.env.JWT_SECRET);
      c.header("X-Refreshed-Token", newToken);
    }

    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});

export async function signJwt(userId: number, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDays = 30 * 24 * 60 * 60;

  const header = { alg: "HS256", typ: "JWT" };
  const payload: JwtPayload = {
    sub: userId,
    iat: now,
    exp: now + thirtyDays,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await importHmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput),
  );

  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature)),
  );

  return `${signingInput}.${encodedSignature}`;
}

export async function verifyJwt(
  token: string,
  secret: string,
): Promise<JwtPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await importHmacKey(secret, ["verify"]);
  const signatureBytes = Uint8Array.from(
    atob(base64UrlDecode(encodedSignature)),
    (c) => c.charCodeAt(0),
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(signingInput),
  );

  if (!valid) {
    throw new Error("Invalid signature");
  }

  const payload: JwtPayload = JSON.parse(atob(base64UrlDecode(encodedPayload)));

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new Error("Token expired");
  }

  return payload;
}

function importHmacKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  return str.replace(/-/g, "+").replace(/_/g, "/");
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function pbkdf2Derive(
  password: string,
  salt: BufferSource,
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256,
  );

  return new Uint8Array(derivedBits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2Derive(password, salt);
  return `${toHex(salt)}:${toHex(hash)}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, expectedHashHex] = storedHash.split(":");
  const salt = Uint8Array.from(
    saltHex.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [],
  );
  const hash = await pbkdf2Derive(password, salt);
  return toHex(hash) === expectedHashHex;
}
