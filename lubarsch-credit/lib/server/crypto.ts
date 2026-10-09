/**
 * AES-256-GCM encryption for sensitive fields (BVN, ID numbers) at rest.
 * DATA_ENCRYPTION_KEY must be 32 random bytes, base64-encoded:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key(): Buffer {
  const k = process.env.DATA_ENCRYPTION_KEY;
  if (k) {
    const buf = Buffer.from(k, "base64");
    if (buf.length !== 32) throw new Error("DATA_ENCRYPTION_KEY must be 32 bytes (base64).");
    return buf;
  }
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_ENCRYPTION_KEY) {
    throw new Error("DATA_ENCRYPTION_KEY is not set. Refusing to store sensitive data.");
  }
  return createHash("sha256").update("lubarsch-dev-only-key — never use in production").digest();
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${enc.toString("base64")}`;
}

export function decrypt(payload: string): string {
  const [v, iv, tag, data] = payload.split(":");
  if (v !== "v1") throw new Error("Unknown ciphertext version");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}

export function mask(value: string, visible = 4): string {
  const v = value.replace(/\s/g, "");
  return v.length <= visible ? v : `${"•".repeat(Math.max(0, v.length - visible))}${v.slice(-visible)}`;
}
