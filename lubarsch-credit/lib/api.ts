/**
 * Every form posts through here. In the static demo build (NEXT_PUBLIC_DEMO_MODE=true)
 * there is no server, so answers are simulated in the browser and nothing is sent anywhere.
 */
import { normalizeNigerianPhone } from "./validation";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export interface ApiResult {
  ok: boolean;
  status: number;
  body: Record<string, unknown>;
}

export async function postJson(url: string, payload: Record<string, unknown>): Promise<ApiResult> {
  if (DEMO_MODE) return demoResponse(url, payload);
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

// ── Demo-only simulation ────────────────────────────────────────────────
const DEMO_KEY = "lc_demo_applications";

function demoApps(): { reference: string; phone: string; firstName: string; createdAt: string }[] {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) ?? "[]"); } catch { return []; }
}

async function demoResponse(url: string, p: Record<string, unknown>): Promise<ApiResult> {
  await new Promise((r) => setTimeout(r, 700)); // feel like a real network call
  if (url === "/api/applications") {
    const apps = demoApps();
    const reference = `LBC-${new Date().getFullYear()}-${String(apps.length + 1).padStart(6, "0")}`;
    apps.push({ reference, phone: normalizeNigerianPhone(String(p.phone)) ?? "", firstName: String(p.fullName ?? "").split(" ")[0], createdAt: new Date().toISOString() });
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(apps)); } catch {}
    return { ok: true, status: 200, body: { ok: true, reference } };
  }
  if (url === "/api/status") {
    const phone = normalizeNigerianPhone(String(p.phone));
    const ref = String(p.reference ?? "").trim().toUpperCase();
    const app = demoApps().find((a) => a.reference === ref && a.phone === phone);
    if (!app) return { ok: false, status: 404, body: { error: "notFound" } };
    return { ok: true, status: 200, body: { ok: true, reference: app.reference, status: "received", updatedAt: app.createdAt, firstName: app.firstName } };
  }
  return { ok: true, status: 200, body: { ok: true } };
}
