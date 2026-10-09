/**
 * Shared protection for every public form endpoint:
 *  - same-origin check, JSON size limit
 *  - rate limiting (in-memory; use Upstash/Redis or Vercel WAF for multi-instance production)
 *  - honeypot field ("website") — bots fill it, people never see it
 *  - Cloudflare Turnstile, when TURNSTILE_SECRET_KEY is set
 */
import { NextResponse } from "next/server";

const buckets = new Map<string, number[]>();

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 10_000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return true;
}

async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

type GuardResult = { ok: true; body: Record<string, unknown>; ip: string } | { ok: false; response: NextResponse };

export async function guardForm(
  req: Request,
  opts: { name: string; limit?: number; windowMs?: number; maxBytes?: number },
): Promise<GuardResult> {
  const ip = clientIp(req);
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return { ok: false, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  if (!rateLimit(`${opts.name}:${ip}`, opts.limit ?? 5, opts.windowMs ?? 10 * 60_000)) {
    return { ok: false, response: NextResponse.json({ error: "tooMany" }, { status: 429 }) };
  }
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > (opts.maxBytes ?? 20_000)) return { ok: false, response: NextResponse.json({ error: "tooLarge" }, { status: 413 }) };

  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > (opts.maxBytes ?? 20_000)) return { ok: false, response: NextResponse.json({ error: "tooLarge" }, { status: 413 }) };
    body = JSON.parse(text);
    if (typeof body !== "object" || body === null || Array.isArray(body)) throw new Error();
  } catch {
    return { ok: false, response: NextResponse.json({ error: "badRequest" }, { status: 400 }) };
  }

  // Honeypot: pretend success so bots learn nothing.
  if (typeof body.website === "string" && body.website.length > 0) {
    return { ok: false, response: NextResponse.json({ ok: true }) };
  }
  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return { ok: false, response: NextResponse.json({ error: "captcha" }, { status: 400 }) };
  }
  return { ok: true, body, ip };
}

/** Trim and cap a free-text field. */
export function str(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
