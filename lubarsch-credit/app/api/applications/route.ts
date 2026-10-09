import { NextResponse } from "next/server";
import { calculateQuote } from "@/lib/calculator";
import { isProductId } from "@/config/products";
import { isLocale } from "@/lib/i18n-config";
import {
  emptyApplication, normalizeNigerianPhone, validateApplication, type ApplicationInput,
} from "@/lib/validation";
import { encrypt } from "@/lib/server/crypto";
import { guardForm } from "@/lib/server/guard";
import { getRepository } from "@/lib/server/repository";
import { notifyApplicationReceived } from "@/lib/server/notify";

export const runtime = "nodejs";

const MAX_PHOTO_CHARS = 1_200_000; // ~900KB after base64 — photos are compressed in the browser first

export async function POST(req: Request) {
  const guard = await guardForm(req, { name: "apply", limit: 5, windowMs: 60 * 60_000, maxBytes: MAX_PHOTO_CHARS + 20_000 });
  if (!guard.ok) return guard.response;
  const raw = guard.body;

  // Build a clean object with only known fields and the right types.
  const a: ApplicationInput = { ...emptyApplication };
  for (const key of Object.keys(emptyApplication) as (keyof ApplicationInput)[]) {
    const v = raw[key];
    const def = emptyApplication[key];
    if (typeof def === "boolean") (a as unknown as Record<string, unknown>)[key] = v === true;
    else if (typeof def === "number") (a as unknown as Record<string, unknown>)[key] = Number(v);
    else (a as unknown as Record<string, unknown>)[key] = typeof v === "string" ? v.trim().slice(0, key === "photo" ? MAX_PHOTO_CHARS : 300) : "";
  }

  const errors = validateApplication(a);
  if (Object.keys(errors).length) return NextResponse.json({ error: "validation", fields: errors }, { status: 422 });
  if (a.photo && !/^data:image\/(jpeg|png|webp);base64,/.test(a.photo)) {
    return NextResponse.json({ error: "validation", fields: { photo: "required" } }, { status: 422 });
  }

  const phone = normalizeNigerianPhone(a.phone)!;
  const quoteResult = isProductId(a.product) ? calculateQuote(a.product, a.tenor, a.amount) : null;
  const bvn = a.bvn.replace(/\s/g, "");
  const locale = typeof raw.locale === "string" && isLocale(raw.locale) ? raw.locale : "en";

  try {
    const { bvn: _b, idNumber: _i, photo, ...rest } = a;
    const record = await getRepository().createApplication({
      applicant: {
        ...rest,
        phone,
        whatsapp: a.whatsappSame ? phone : normalizeNigerianPhone(a.whatsapp) ?? phone,
        guarantorPhone: normalizeNigerianPhone(a.guarantorPhone)!,
        bvnLast4: bvn.slice(-4),
        idNumberLast4: a.idNumber.slice(-4),
      },
      bvnEnc: encrypt(bvn),
      idNumberEnc: encrypt(a.idNumber),
      quote: quoteResult?.ok ? quoteResult.quote : null,
      locale,
      photo: photo ? { dataUrl: photo } : null,
    });
    await notifyApplicationReceived(record);
    return NextResponse.json({ ok: true, reference: record.reference });
  } catch (err) {
    console.error("[apply] failed to save application:", (err as Error).message);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }
}
