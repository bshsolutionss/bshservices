import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * AES-256-GCM encryption for credentials stored in the database (SMTP
 * password, Resend API key). The key is derived server-side from APP_SECRET
 * (or, failing that, the Supabase secret key already required by the app), so
 * a database dump alone never reveals the credentials. Server-only.
 */
function key(): Buffer {
  const material = process.env.APP_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!material) throw new Error("Set APP_SECRET (or SUPABASE_SECRET_KEY) to store credentials securely.");
  return createHash("sha256").update(`bsh-secret-box:${material}`).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map((b) => b.toString("base64")).join(".");
}

/** Returns null when the value is missing or can't be decrypted (e.g. the secret was rotated). */
export function decryptSecret(payload: string | null | undefined): string | null {
  if (!payload) return null;
  try {
    const [iv, tag, body] = payload.split(".").map((part) => Buffer.from(part, "base64"));
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
