import { NextResponse } from "next/server";
import { CALL_TIMES, LANGS, isEmail, isFullName, normalizeNigerianPhone, type Errors } from "@/lib/validation";
import { investorNotes } from "@/config/products";
import { guardForm, str } from "@/lib/server/guard";
import { getRepository } from "@/lib/server/repository";
import { notifyInbox } from "@/lib/server/notify";
import type { InboxKind } from "@/lib/server/types";

export const runtime = "nodejs";

type Validator = (b: Record<string, unknown>) => { errors: Errors; payload: Record<string, string> };

const name = (b: Record<string, unknown>, e: Errors) => {
  const v = str(b.name, 100);
  if (!isFullName(v) && v.length < 2) e.name = "required";
  return v;
};
const phone = (b: Record<string, unknown>, e: Errors, required = true) => {
  const raw = str(b.phone, 30);
  const p = normalizeNigerianPhone(raw);
  if (!p && (required || raw)) e.phone = "phone";
  return p ?? "";
};

const validators: Record<InboxKind, Validator> = {
  callback: (b) => {
    const errors: Errors = {};
    const payload = { name: name(b, errors), phone: phone(b, errors), bestTime: str(b.bestTime, 20), language: str(b.language, 5) };
    if (!(CALL_TIMES as readonly string[]).includes(payload.bestTime)) errors.bestTime = "choose";
    if (!(LANGS as readonly string[]).includes(payload.language)) errors.language = "choose";
    return { errors, payload };
  },
  message: (b) => {
    const errors: Errors = {};
    const payload = { name: name(b, errors), phone: phone(b, errors, false), email: str(b.email, 120), message: str(b.message, 2000) };
    if (payload.email && !isEmail(payload.email)) errors.email = "email";
    if (!payload.phone && !payload.email) errors.phone = "phone";
    if (payload.message.length < 5) errors.message = "required";
    return { errors, payload };
  },
  investor: (b) => {
    const errors: Errors = {};
    const payload = { name: name(b, errors), email: str(b.email, 120), phone: phone(b, errors, false), amountRange: str(b.amountRange, 20), tenor: str(b.tenor, 5) };
    if (!isEmail(payload.email)) errors.email = "email";
    if (!["lt1m", "1-5m", "5-20m", "20mplus"].includes(payload.amountRange)) errors.amountRange = "choose";
    if (!investorNotes.tenorsMonths.map(String).includes(payload.tenor)) errors.tenor = "choose";
    return { errors, payload };
  },
  agent: (b) => {
    const errors: Errors = {};
    const payload = { name: name(b, errors), phone: phone(b, errors), role: str(b.role, 20), markets: str(b.markets, 300), about: str(b.about, 1500) };
    if (!["referral", "officer"].includes(payload.role)) errors.role = "choose";
    if (!payload.markets) errors.markets = "required";
    return { errors, payload };
  },
};

export async function POST(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!(kind in validators)) return NextResponse.json({ error: "notFound" }, { status: 404 });
  const guard = await guardForm(req, { name: `form-${kind}`, limit: 5, windowMs: 30 * 60_000 });
  if (!guard.ok) return guard.response;

  const { errors, payload } = validators[kind as InboxKind](guard.body);
  if (Object.keys(errors).length) return NextResponse.json({ error: "validation", fields: errors }, { status: 422 });

  try {
    const item = await getRepository().createInboxItem(kind as InboxKind, payload);
    await notifyInbox(item);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[forms/${kind}]`, (err as Error).message);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }
}
