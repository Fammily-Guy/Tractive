"use client";

import { useState } from "react";
import { CalendarClock, CircleCheck, FileText, Phone, Search, Store, ThumbsUp, Wallet, XCircle } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import { formatDate } from "@/lib/format";
import { isReference, normalizeNigerianPhone } from "@/lib/validation";
import { useI18n } from "@/components/I18nProvider";
import { Honeypot, TextField } from "./Fields";
import { Turnstile } from "./Turnstile";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const ORDER = ["received", "under_review", "visit_scheduled", "approved", "disbursed"] as const;
type Status = (typeof ORDER)[number] | "declined";
const icons = { received: FileText, under_review: Search, visit_scheduled: Store, approved: ThumbsUp, disbursed: Wallet, declined: XCircle };

export function StatusForm() {
  const { dict: t } = useI18n();
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [otp, setOtp] = useState("");
  const [needOtp, setNeedOtp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [token, setToken] = useState("");
  const [result, setResult] = useState<{ status: Status; updatedAt: string; reference: string; firstName: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string | null> = {};
    if (!normalizeNigerianPhone(phone)) errs.phone = t.errors.phone;
    if (!isReference(reference)) errs.reference = t.errors.reference;
    setErrors(errs);
    setMessage(null);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, reference, otp, website: honeypot, turnstileToken: token }),
      });
      const body = await res.json().catch(() => ({}));
      if (body.otpRequired) setNeedOtp(true);
      else if (res.ok && body.status) setResult(body);
      else if (res.status === 429) setMessage(t.errors.tooMany);
      else if (res.status === 404) setMessage(t.status.notFound);
      else setMessage(t.common.somethingWrong);
    } catch {
      setMessage(t.common.somethingWrong);
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const idx = ORDER.indexOf(result.status as (typeof ORDER)[number]);
    const declined = result.status === "declined";
    return (
      <div className="card mx-auto max-w-2xl sm:p-8" aria-live="polite">
        <p className="text-base text-ink-soft">{result.reference}</p>
        <h2 className="h2 mt-1">{t.status.current}: <span className={declined ? "text-gold-dark" : "text-brand"}>{t.status.states[result.status]}</span></h2>
        <p className="mt-3 text-lg">{t.status.explain[result.status]}</p>
        <p className="mt-1 text-sm text-ink-soft">{t.status.updated}: {formatDate(result.updatedAt)}</p>
        {!declined && (
          <ol className="mt-6 space-y-3">
            {ORDER.map((s, i) => {
              const Icon = icons[s];
              const done = i <= idx;
              return (
                <li key={s} className={`flex items-center gap-3 rounded-xl p-3 ${i === idx ? "bg-brand-light font-extrabold" : ""}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${done ? "bg-brand text-white" : "bg-line text-ink-soft"}`}>
                    {done && i < idx ? <CircleCheck className="h-5 w-5" aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <span className={done ? "" : "text-ink-soft"}>{t.status.states[s]}</span>
                </li>
              );
            })}
          </ol>
        )}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href={site.phoneHref} className="btn-outline"><Phone className="h-5 w-5" aria-hidden="true" />{t.status.talk}</a>
          <a href={whatsappLink(`${t.whatsapp.default} (${result.reference})`)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp"><WhatsAppIcon className="h-5 w-5" aria-hidden="true" />{t.common.whatsapp}</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card mx-auto max-w-xl space-y-5 sm:p-8">
      <Honeypot value={honeypot} onValue={setHoneypot} />
      <TextField name="phone" label={t.status.phone} type="tel" inputMode="tel" autoComplete="tel" value={phone} onValue={setPhone} error={errors.phone} />
      <TextField name="reference" label={t.status.reference} placeholder="LBC-2026-000123" autoCapitalize="characters" value={reference} onValue={(v) => setReference(v.toUpperCase())} error={errors.reference} />
      {needOtp && (
        <TextField name="otp" label={t.status.otp} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onValue={(v) => setOtp(v.replace(/\D/g, ""))} />
      )}
      <Turnstile onToken={setToken} />
      {message && <p className="rounded-xl bg-gold-light p-3 font-semibold" role="alert">{message}</p>}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        <CalendarClock className="h-5 w-5" aria-hidden="true" />
        {busy ? t.common.sending : needOtp ? t.status.verify : t.status.check}
      </button>
    </form>
  );
}
