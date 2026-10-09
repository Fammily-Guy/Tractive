import { NextResponse } from "next/server";
import { isReference, normalizeNigerianPhone } from "@/lib/validation";
import { guardForm, str } from "@/lib/server/guard";
import { getRepository } from "@/lib/server/repository";
import { checkOtp, issueOtp, otpRequired } from "@/lib/server/otp";
import { getMessageSender } from "@/lib/server/integrations/messaging";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = await guardForm(req, { name: "status", limit: 10, windowMs: 10 * 60_000 });
  if (!guard.ok) return guard.response;
  const phone = normalizeNigerianPhone(str(guard.body.phone, 30));
  const reference = str(guard.body.reference, 30).toUpperCase();
  const otp = str(guard.body.otp, 10);

  if (!phone || !isReference(reference)) return NextResponse.json({ error: "notFound" }, { status: 404 });
  const app = await getRepository().findByReference(reference);
  // Same answer whether the reference or the phone is wrong — don't leak which.
  if (!app || app.applicant.phone !== phone) return NextResponse.json({ error: "notFound" }, { status: 404 });

  if (otpRequired()) {
    const key = `${reference}:${phone}`;
    if (!otp) {
      const code = issueOtp(key);
      await getMessageSender().sendSms(phone, `Your Lubarsch Credit code is ${code}. It expires in 10 minutes. Never share it with anyone.`).catch(() => {});
      return NextResponse.json({ otpRequired: true });
    }
    if (!checkOtp(key, otp)) return NextResponse.json({ error: "otp" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    reference: app.reference,
    status: app.status,
    updatedAt: app.updatedAt,
    firstName: app.applicant.fullName.split(" ")[0],
  });
}
