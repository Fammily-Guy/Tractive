import { createHash, randomInt } from "node:crypto";

/** One-time codes for /check-status (enable with STATUS_OTP_REQUIRED=true). In-memory: use Redis on multi-instance hosting. */
const codes = new Map<string, { hash: string; expires: number; tries: number }>();
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

export function issueOtp(key: string): string {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  codes.set(key, { hash: hash(code), expires: Date.now() + 10 * 60_000, tries: 0 });
  return code;
}

export function checkOtp(key: string, code: string): boolean {
  const entry = codes.get(key);
  if (!entry || entry.expires < Date.now() || entry.tries >= 5) return false;
  entry.tries++;
  if (entry.hash !== hash(code.trim())) return false;
  codes.delete(key);
  return true;
}

export const otpRequired = () => process.env.STATUS_OTP_REQUIRED === "true";
