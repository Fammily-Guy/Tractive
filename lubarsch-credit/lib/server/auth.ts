/**
 * Staff authentication (scaffold): email + password + TOTP 2FA, signed session cookie, roles.
 *
 * Staff accounts live in the ADMIN_USERS env var (JSON). Create a password hash with
 *   npm run hash-password -- "the-password"
 * and a 2FA secret with the same script (it prints one). Add the secret to any authenticator app.
 *
 * Moving to Supabase Auth later: replace getStaffUsers/verifyLogin with Supabase calls —
 * the rest of the dashboard only uses getSession()/requireStaff().
 */
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { StaffRole } from "./types";

export interface StaffUser {
  email: string;
  name: string;
  role: StaffRole;
  passwordHash: string;
  totpSecret?: string;
}

export interface Session {
  email: string;
  name: string;
  role: StaffRole;
  exp: number;
}

const COOKIE = "lc_admin";
const SESSION_HOURS = 8;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET (32+ chars) is required in production.");
  return "dev-only-session-secret-change-me-please-0000";
}

export function getStaffUsers(): StaffUser[] {
  const raw = process.env.ADMIN_USERS;
  if (raw) {
    try {
      return JSON.parse(raw) as StaffUser[];
    } catch {
      console.error("[auth] ADMIN_USERS is not valid JSON");
      return [];
    }
  }
  if (process.env.NODE_ENV !== "production") {
    // Development only — never active in production builds.
    return [
      { email: "admin@example.com", name: "Dev Admin", role: "admin", passwordHash: hashPassword("change-me", "devsalt") },
      { email: "officer@example.com", name: "Dev Officer", role: "officer", passwordHash: hashPassword("change-me", "devsalt") },
    ];
  }
  return [];
}

export function hashPassword(password: string, salt: string): string {
  return `scrypt$${salt}$${scryptSync(password, salt, 32).toString("base64")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const a = Buffer.from(hash, "base64");
  const b = scryptSync(password, salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ── TOTP (RFC 6238) ─────────────────────────────────────────────────────
function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of input.replace(/=+$/, "").toUpperCase().replace(/\s/g, "")) {
    const v = alphabet.indexOf(c);
    if (v < 0) continue;
    bits += v.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function totp(secretB32: string, time = Date.now(), step = 30): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(time / 1000 / step)));
  const h = createHmac("sha1", base32Decode(secretB32)).update(counter).digest();
  const o = h[h.length - 1] & 0xf;
  const code = ((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).toString();
  return code.padStart(6, "0");
}

function verifyTotp(secretB32: string, code: string): boolean {
  const now = Date.now();
  return [-30_000, 0, 30_000].some((d) => totp(secretB32, now + d) === code.trim());
}

// ── Sessions ────────────────────────────────────────────────────────────
function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function verifyLogin(email: string, password: string, code: string): StaffUser | null {
  const user = getStaffUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  // Always run a hash to keep timing similar for unknown emails.
  const ok = verifyPassword(password, user?.passwordHash ?? hashPassword("x", "timing"));
  if (!user || !ok) return null;
  if (user.totpSecret && !verifyTotp(user.totpSecret, code)) return null;
  if (!user.totpSecret && process.env.NODE_ENV === "production") return null; // 2FA is mandatory in production
  return user;
}

export async function createSession(user: StaffUser) {
  const session: Session = { email: user.email, name: user.name, role: user.role, exp: Date.now() + SESSION_HOURS * 3600_000 };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (s.exp < Date.now()) return null;
    // Re-check the account still exists with the same role.
    const u = getStaffUsers().find((x) => x.email === s.email);
    if (!u || u.role !== s.role) return null;
    return s;
  } catch {
    return null;
  }
}

/** Use at the top of every admin page, action and route. */
export async function requireStaff(roles: StaffRole[] = ["admin", "officer", "viewer"]): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!roles.includes(s.role)) redirect("/admin?denied=1");
  return s;
}

export function officers(): { email: string; name: string }[] {
  return getStaffUsers().filter((u) => u.role === "officer" || u.role === "admin").map((u) => ({ email: u.email, name: u.name }));
}
