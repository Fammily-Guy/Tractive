"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, Camera, Check, Eye, EyeOff, HelpCircle, Lock, Package, Phone, RefreshCw, Scissors, Shirt,
  ShoppingBasket, Smartphone, Sparkles, Store, UtensilsCrossed, Wheat, X,
} from "lucide-react";
import { products, isProductId, lending, type ProductId } from "@/config/products";
import { site, whatsappLink } from "@/config/site";
import { calculateQuote } from "@/lib/calculator";
import { formatNaira, formatPercent } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { compressImage } from "@/lib/image";
import { markets, lgas } from "@/lib/content";
import {
  APPLY_STEPS, BUSINESS_TYPES, GENDERS, ID_TYPES, LANGS, PURPOSES, RELATIONSHIPS, SALES, YEARS,
  emptyApplication, stepOfField, validateApplicationStep, type ApplicationInput, type Errors,
} from "@/lib/validation";
import { useI18n } from "@/components/I18nProvider";
import { postJson } from "@/lib/api";
import { Checkbox, FieldError, Honeypot, RadioGroup, SelectField, TextField } from "./Fields";
import { Turnstile } from "./Turnstile";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const STORAGE_KEY = "lc_apply_v1";
/** Never kept on the phone: shared phones are common, so sensitive fields must be re-entered. */
const NOT_STORED: (keyof ApplicationInput)[] = ["bvn", "idNumber", "photo"];

const businessIcons: Record<string, React.ReactNode> = {
  foodstuff: <Wheat className="h-7 w-7 text-brand" aria-hidden="true" />,
  fabrics: <Shirt className="h-7 w-7 text-brand" aria-hidden="true" />,
  provisions: <ShoppingBasket className="h-7 w-7 text-brand" aria-hidden="true" />,
  "food-vendor": <UtensilsCrossed className="h-7 w-7 text-brand" aria-hidden="true" />,
  "hair-beauty": <Sparkles className="h-7 w-7 text-brand" aria-hidden="true" />,
  tailoring: <Scissors className="h-7 w-7 text-brand" aria-hidden="true" />,
  "phone-accessories": <Smartphone className="h-7 w-7 text-brand" aria-hidden="true" />,
  other: <Package className="h-7 w-7 text-brand" aria-hidden="true" />,
};

export function ApplyForm() {
  const { dict: t, locale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [data, setData] = useState<ApplicationInput>(emptyApplication);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [restored, setRestored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showBvn, setShowBvn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ── Load saved progress + calculator values from the URL ──────────────
  useEffect(() => {
    let next = { ...emptyApplication };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { data: Partial<ApplicationInput>; step: number };
        next = { ...next, ...parsed.data };
        if (parsed.step >= 1 && parsed.step <= APPLY_STEPS) setStep(parsed.step);
        setRestored(true);
      }
    } catch {}
    const p = params.get("product");
    if (isProductId(p)) {
      next.product = p;
      const tenor = params.get("tenor");
      next.tenor = products[p].tenors.some((x) => x.id === tenor) ? tenor! : products[p].tenors[0].id;
      const amt = Number(params.get("amount"));
      if (amt > 0) next.amount = amt;
      else next.amount = Math.min(Math.max(next.amount, products[p].minAmount), products[p].maxAmount);
    }
    if (!next.language) next.language = locale;
    setData(next);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save progress on every change ─────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    try {
      const safe = { ...data };
      for (const k of NOT_STORED) (safe as Record<string, unknown>)[k] = emptyApplication[k];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: safe, step }));
    } catch {}
  }, [data, step, loaded]);

  const set = useCallback(<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: undefined } : e));
  }, []);

  const product = products[(isProductId(data.product) ? data.product : "daily") as ProductId];
  const quote = useMemo(() => (isProductId(data.product) ? calculateQuote(data.product, data.tenor, data.amount) : null), [data.product, data.tenor, data.amount]);

  const err = (key: string) => {
    const k = errors[key];
    if (!k) return null;
    return fill(t.errors[k], { min: formatNaira(product.minAmount), max: formatNaira(product.maxAmount) });
  };

  function focusFirstError(errs: Errors) {
    const first = Object.keys(errs)[0];
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  function goTo(n: number) {
    setStep(n);
    setErrors({});
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function next() {
    const errs = validateApplicationStep(step, data);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    goTo(step + 1);
  }

  function startOver() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setData({ ...emptyApplication, language: locale });
    setRestored(false);
    goTo(1);
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    try {
      set("photo", await compressImage(file));
    } catch {
      set("photo", "");
    } finally {
      setPhotoBusy(false);
    }
  }

  function whatsappSummary() {
    const m = data.market === "other" ? data.marketOther : markets.find((x) => x.id === data.market)?.name ?? data.market;
    return [
      t.apply.whatsappIntro,
      `• ${t.apply.fields.fullName}: ${data.fullName}`,
      `• ${t.apply.fields.phone}: ${data.phone}`,
      `• ${t.apply.fields.businessType}: ${t.apply.options.business[data.businessType as keyof typeof t.apply.options.business] ?? ""}`,
      `• ${t.apply.fields.market}: ${m} ${data.stall}`,
      `• ${t.apply.fields.product}: ${t.products[product.id].name}, ${data.tenor}`,
      `• ${t.apply.fields.amount}: ${formatNaira(data.amount)}`,
    ].join("\n");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < APPLY_STEPS) return next();
    for (let s = 1; s <= APPLY_STEPS; s++) {
      const errs = validateApplicationStep(s, data);
      if (Object.keys(errs).length) {
        if (s !== step) goTo(s);
        setErrors(errs);
        focusFirstError(errs);
        return;
      }
    }
    setSubmitting(true);
    setFailed(false);
    try {
      const res = await postJson("/api/applications", { ...data, website: honeypot, turnstileToken, locale });
      const body = res.body as Record<string, any>;
      if (res.ok && body.reference) {
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
        router.push(`/apply/success?ref=${encodeURIComponent(body.reference)}`);
        return;
      }
      if (res.status === 422 && body.fields) {
        const errs = body.fields as Errors;
        const firstStep = Math.min(...Object.keys(errs).map(stepOfField));
        if (firstStep !== step) goTo(firstStep);
        setErrors(errs);
        focusFirstError(errs);
        return;
      }
      setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  const f = t.apply.fields;
  const o = t.apply.options;
  const unit = product.period === "day" ? t.common.days : t.common.weeks;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <div className="mb-6">
        <p className="text-base font-bold text-brand">{fill(t.apply.stepOf, { n: step, total: APPLY_STEPS })}</p>
        <ol className="mt-2 grid grid-cols-5 gap-1.5" aria-label={fill(t.apply.stepOf, { n: step, total: APPLY_STEPS })}>
          {t.apply.steps.map((label, i) => (
            <li key={label} className="text-center">
              <span className={`block h-2.5 rounded-full ${i + 1 <= step ? "bg-brand" : "bg-line"}`} />
              <span className={`mt-1 hidden text-xs font-semibold sm:block ${i + 1 === step ? "text-brand" : "text-ink-soft"}`}>{label}</span>
              <span className="sr-only">{label}{i + 1 < step ? " ✓" : ""}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 flex items-center gap-1 text-sm text-ink-soft"><Check className="h-4 w-4 text-success" aria-hidden="true" />{t.apply.saved}</p>
      </div>

      {restored && step > 1 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gold-light p-4">
          <p className="font-semibold"><strong>{t.apply.resumeTitle}</strong> {t.apply.resume}</p>
          <button type="button" onClick={startOver} className="btn-ghost min-h-12 px-3 text-sm"><RefreshCw className="h-4 w-4" aria-hidden="true" />{t.apply.startOver}</button>
        </div>
      )}

      <form ref={formRef} onSubmit={submit} noValidate className="card space-y-6 sm:p-8">
        <h2 ref={headingRef} tabIndex={-1} className="h2 outline-none">{t.apply.steps[step - 1]}</h2>
        <Honeypot value={honeypot} onValue={setHoneypot} />

        {Object.values(errors).some(Boolean) && (
          <p className="rounded-xl bg-danger-light p-3 font-bold text-danger" role="alert">{t.errors.fixBelow}</p>
        )}

        {/* ── STEP 1: About you ───────────────────────── */}
        {step === 1 && (
          <>
            <TextField name="fullName" label={f.fullName} hint={f.fullNameHint} autoComplete="name" value={data.fullName} onValue={(v) => set("fullName", v)} error={err("fullName")} />
            <TextField name="phone" label={f.phone} hint={f.phoneHint} type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onValue={(v) => set("phone", v)} error={err("phone")} />
            <Checkbox name="whatsappSame" label={f.sameAsPhone} checked={data.whatsappSame} onChecked={(v) => set("whatsappSame", v)} />
            {!data.whatsappSame && (
              <TextField name="whatsapp" label={f.whatsapp} type="tel" inputMode="tel" value={data.whatsapp} onValue={(v) => set("whatsapp", v)} error={err("whatsapp")} />
            )}
            <RadioGroup name="gender" legend={f.gender} columns={3} value={data.gender} onValue={(v) => set("gender", v)} error={err("gender")}
              options={GENDERS.map((g) => ({ value: g, label: f[g] }))} />
            <TextField name="dob" label={f.dob} type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} value={data.dob} onValue={(v) => set("dob", v)} error={err("dob")} />
            <TextField name="address" label={f.address} autoComplete="street-address" value={data.address} onValue={(v) => set("address", v)} error={err("address")} />
            <SelectField name="lga" label={f.lga} placeholder={f.chooseLga} value={data.lga} onValue={(v) => set("lga", v)} error={err("lga")}
              options={lgas.map((l) => ({ value: l, label: l }))} />
            <RadioGroup name="language" legend={f.language} columns={3} value={data.language} onValue={(v) => set("language", v)} error={err("language")}
              options={LANGS.map((l) => ({ value: l, label: o.language[l] }))} />
          </>
        )}

        {/* ── STEP 2: Your business ───────────────────── */}
        {step === 2 && (
          <>
            <RadioGroup name="businessType" legend={f.businessType} columns={4} value={data.businessType} onValue={(v) => set("businessType", v)} error={err("businessType")}
              options={BUSINESS_TYPES.map((b) => ({ value: b, label: o.business[b], icon: businessIcons[b] }))} />
            <SelectField name="market" label={f.market} placeholder={f.chooseMarket} value={data.market} onValue={(v) => set("market", v)} error={err("market")}
              options={[...markets.map((m) => ({ value: m.id, label: m.name })), { value: "other", label: o.business.other }]} />
            {data.market === "other" && (
              <TextField name="marketOther" label={f.otherMarket} value={data.marketOther} onValue={(v) => set("marketOther", v)} error={err("marketOther")} />
            )}
            <TextField name="stall" label={f.stall} hint={f.stallHint} value={data.stall} onValue={(v) => set("stall", v)} error={err("stall")} />
            <RadioGroup name="years" legend={f.years} value={data.years} onValue={(v) => set("years", v)} error={err("years")}
              options={YEARS.map((y) => ({ value: y, label: o.years[y] }))} />
            <RadioGroup name="dailySales" legend={f.dailySales} columns={1} value={data.dailySales} onValue={(v) => set("dailySales", v)} error={err("dailySales")}
              options={SALES.map((s) => ({ value: s, label: o.sales[s] }))} />
          </>
        )}

        {/* ── STEP 3: Your loan ───────────────────────── */}
        {step === 3 && (
          <>
            <RadioGroup name="product" legend={f.product} value={data.product}
              onValue={(v) => {
                if (!isProductId(v)) return;
                const p = products[v];
                setData((d) => ({ ...d, product: v, tenor: p.tenors[0].id, amount: Math.min(Math.max(d.amount, p.minAmount), p.maxAmount) }));
              }}
              error={err("product")}
              options={(["daily", "weekly"] as const).map((p) => ({ value: p, label: t.products[p].name }))} />
            <RadioGroup name="tenor" legend={f.tenor} value={data.tenor} onValue={(v) => set("tenor", v)} error={err("tenor")}
              options={product.tenors.map((x) => ({ value: x.id, label: `${x.periods} ${unit}` }))} />
            <TextField name="amount" label={f.amount} inputMode="numeric" value={data.amount ? String(data.amount) : ""}
              onValue={(v) => set("amount", Number(v.replace(/\D/g, "").slice(0, 9)))}
              hint={fill(t.calculator.amountHint, { min: formatNaira(product.minAmount), max: formatNaira(product.maxAmount) })}
              error={err("amount")} />
            <QuoteBox quote={quote} />
            <RadioGroup name="purpose" legend={f.purpose} value={data.purpose} onValue={(v) => set("purpose", v)} error={err("purpose")}
              options={PURPOSES.map((p) => ({ value: p, label: o.purpose[p] }))} />
          </>
        )}

        {/* ── STEP 4: Identity & guarantor ────────────── */}
        {step === 4 && (
          <>
            <RadioGroup name="idType" legend={f.idType} value={data.idType} onValue={(v) => set("idType", v)} error={err("idType")}
              options={ID_TYPES.map((i) => ({ value: i, label: o.idType[i] }))} />
            <TextField name="idNumber" label={f.idNumber} autoComplete="off" value={data.idNumber} onValue={(v) => set("idNumber", v)} error={err("idNumber")} />
            <div>
              <TextField
                name="bvn"
                label={f.bvn}
                type={showBvn ? "text" : "password"}
                inputMode="numeric"
                autoComplete="off"
                maxLength={11}
                value={data.bvn}
                onValue={(v) => set("bvn", v.replace(/\D/g, "").slice(0, 11))}
                error={err("bvn")}
              />
              <button type="button" onClick={() => setShowBvn((s) => !s)} className="btn-ghost mt-1 min-h-12 px-3 text-sm" aria-pressed={showBvn}>
                {showBvn ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                {showBvn ? f.hideBvn : f.showBvn}
              </button>
              <p className="mt-2 flex gap-2 rounded-xl bg-brand-light p-3 text-base">
                <Lock className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />{f.bvnWhy}
              </p>
            </div>

            <div>
              <p className="label">{f.photo} <span className="font-normal text-ink-soft">({t.common.optional})</span></p>
              <p className="hint mb-2">{f.photoHint}</p>
              {data.photo ? (
                <div className="flex items-center gap-3 rounded-xl border-2 border-brand bg-brand-light p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.photo} alt={f.photoAdded} className="h-16 w-16 rounded-lg object-cover" />
                  <span className="flex-1 font-bold">{f.photoAdded}</span>
                  <button type="button" onClick={() => set("photo", "")} className="btn-ghost min-h-12 px-3"><X className="h-5 w-5" aria-hidden="true" />{f.removePhoto}</button>
                </div>
              ) : (
                <label className="choice justify-center border-dashed">
                  <Camera className="h-6 w-6 text-brand" aria-hidden="true" />
                  <span>{photoBusy ? t.common.sending : f.photo}</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
                </label>
              )}
            </div>

            <hr className="border-line" />
            <TextField name="guarantorName" label={f.guarantorName} value={data.guarantorName} onValue={(v) => set("guarantorName", v)} error={err("guarantorName")} />
            <TextField name="guarantorPhone" label={f.guarantorPhone} type="tel" inputMode="tel" value={data.guarantorPhone} onValue={(v) => set("guarantorPhone", v)} error={err("guarantorPhone")} />
            <RadioGroup name="guarantorRelationship" legend={f.guarantorRelationship} value={data.guarantorRelationship} onValue={(v) => set("guarantorRelationship", v)} error={err("guarantorRelationship")}
              options={RELATIONSHIPS.map((r) => ({ value: r, label: o.relationship[r] }))} />
            <TextField name="agentCode" label={`${f.agentCode} (${t.common.optional})`} hint={f.agentCodeHint} value={data.agentCode} onValue={(v) => set("agentCode", v)} />
          </>
        )}

        {/* ── STEP 5: Review & consent ───────────────── */}
        {step === 5 && (
          <>
            <Review data={data} onEdit={goTo} />
            <div className="rounded-2xl border-2 border-gold bg-gold-light/60 p-4">
              <h3 className="h3">{t.apply.review.costTitle}</h3>
              <p className="text-base text-ink-soft">{t.apply.review.costNote}</p>
              <QuoteBox quote={quote} full />
            </div>
            <Checkbox name="consentTerms" checked={data.consentTerms} onChecked={(v) => set("consentTerms", v)} error={err("consentTerms")}
              label={<>{t.apply.review.consentTerms} <Link className="font-bold text-brand underline" href="/legal/terms" target="_blank">{t.meta.terms}</Link> · <Link className="font-bold text-brand underline" href="/legal/fair-collection" target="_blank">{t.meta.fairCollection}</Link></>} />
            <Checkbox name="consentPrivacy" checked={data.consentPrivacy} onChecked={(v) => set("consentPrivacy", v)} error={err("consentPrivacy")}
              label={<>{t.apply.review.consentPrivacy} <Link className="font-bold text-brand underline" href="/legal/privacy" target="_blank">{t.meta.privacy}</Link></>} />
            <Checkbox name="consentContact" checked={data.consentContact} onChecked={(v) => set("consentContact", v)} label={t.apply.review.consentContact} />
            <p className="flex items-center gap-2 font-semibold text-brand"><Lock className="h-5 w-5" aria-hidden="true" />{t.apply.review.noContacts}</p>
            <Turnstile onToken={setTurnstileToken} />
          </>
        )}

        {failed && (
          <div className="rounded-2xl border-2 border-danger bg-danger-light p-4" role="alert">
            <h3 className="h3 text-danger">{t.apply.failed.title}</h3>
            <p className="mt-1">{t.apply.failed.text}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button type="submit" className="btn-outline"><RefreshCw className="h-5 w-5" aria-hidden="true" />{t.apply.failed.retry}</button>
              <a href={whatsappLink(whatsappSummary())} target="_blank" rel="noopener noreferrer" className="btn-whatsapp"><WhatsAppIcon className="h-5 w-5" aria-hidden="true" />{t.apply.failed.whatsapp}</a>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <button type="button" onClick={() => goTo(step - 1)} className="btn-outline"><ArrowLeft className="h-5 w-5" aria-hidden="true" />{t.common.back}</button>
          ) : <span />}
          {step < APPLY_STEPS ? (
            <button type="button" onClick={next} className="btn-primary">{t.common.next}<ArrowRight className="h-5 w-5" aria-hidden="true" /></button>
          ) : (
            <button type="submit" className="btn-primary text-lg" disabled={submitting}>
              {submitting ? t.common.sending : t.apply.review.submit}
              {!submitting && <Check className="h-5 w-5" aria-hidden="true" />}
            </button>
          )}
        </div>
      </form>

      {/* Alternative paths — on every step */}
      <aside className="mt-6 rounded-2xl bg-brand-light p-5" aria-labelledby="prefer-talk">
        <h2 id="prefer-talk" className="flex items-center gap-2 text-lg font-extrabold"><HelpCircle className="h-6 w-6 text-brand" aria-hidden="true" />{t.apply.preferTalk}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <a href={site.phoneHref} className="btn-outline px-3"><Phone className="h-5 w-5" aria-hidden="true" />{t.common.callUs}</a>
          <a href={whatsappLink(t.whatsapp.default)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-3"><WhatsAppIcon className="h-5 w-5" aria-hidden="true" />{t.common.whatsapp}</a>
          <a href={whatsappLink(t.apply.visitMessage + (data.fullName || ""))} target="_blank" rel="noopener noreferrer" className="btn-outline px-3"><Store className="h-5 w-5" aria-hidden="true" />{t.apply.askVisit}</a>
        </div>
      </aside>
    </div>
  );
}

function QuoteBox({ quote, full = false }: { quote: ReturnType<typeof calculateQuote> | null; full?: boolean }) {
  const { dict: t } = useI18n();
  if (!quote) return null;
  if (!quote.ok) {
    const p = products.daily;
    return <FieldError id="quote-err" message={fill(t.calculator.errors[quote.error], { min: formatNaira(quote.min ?? p.minAmount), max: formatNaira(quote.max ?? p.maxAmount) })} />;
  }
  const q = quote.quote;
  const per = q.period === "day" ? t.common.day : t.common.week;
  const rows: [string, string][] = [
    [t.calculator.asked, formatNaira(q.principal)],
    [t.calculator.adminFee, `− ${formatNaira(lending.adminFee)}`],
    [`${t.calculator.interest} (${formatPercent(q.interestRate)}, ${q.interestTiming === "upfront" ? t.calculator.interestUpfront : t.calculator.interestInRepay})`, q.interestTiming === "upfront" ? `− ${formatNaira(q.interest)}` : formatNaira(q.interest)],
    [t.calculator.cashToday, formatNaira(q.cashReceived)],
    [fill(t.calculator.payEach, { period: per }), formatNaira(q.instalment)],
    [t.calculator.numPayments, String(q.numberOfPayments)],
    [t.calculator.totalBack, formatNaira(q.totalRepaid)],
    [t.calculator.totalCost, formatNaira(q.totalCost)],
  ];
  return (
    <div className={full ? "mt-3" : "rounded-2xl bg-brand-light p-4"} aria-live="polite">
      {full ? (
        <dl className="divide-y divide-line/70">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 py-2"><dt>{k}</dt><dd className="shrink-0 font-extrabold tabular-nums">{v}</dd></div>
          ))}
        </dl>
      ) : null}
      <p className={`font-bold ${full ? "mt-3 rounded-xl bg-white p-3" : ""}`}>
        {fill(q.period === "day" ? t.calculator.sentenceDaily : t.calculator.sentenceWeekly, {
          principal: formatNaira(q.principal), cash: formatNaira(q.cashReceived), instalment: formatNaira(q.instalment), n: q.numberOfPayments,
        })}
      </p>
      <p className="mt-2 text-sm text-ink-soft">{t.calculator.smallPrint}</p>
    </div>
  );
}

function Review({ data, onEdit }: { data: ApplicationInput; onEdit: (step: number) => void }) {
  const { dict: t } = useI18n();
  const f = t.apply.fields;
  const o = t.apply.options;
  const none = t.apply.review.notSet;
  const marketName = data.market === "other" ? data.marketOther : markets.find((m) => m.id === data.market)?.name ?? data.market;
  const unit = isProductId(data.product) && products[data.product].period === "day" ? t.common.days : t.common.weeks;
  const tenor = isProductId(data.product) ? products[data.product].tenors.find((x) => x.id === data.tenor) : undefined;
  const pick = <T extends Record<string, string>>(map: T, key: string) => (map as Record<string, string>)[key] ?? none;

  const groups: { step: number; rows: [string, string][] }[] = [
    { step: 1, rows: [[f.fullName, data.fullName], [f.phone, data.phone], [f.whatsapp, data.whatsappSame ? data.phone : data.whatsapp], [f.dob, data.dob], [f.address, data.address], [f.lga, data.lga]] },
    { step: 2, rows: [[f.businessType, pick(o.business, data.businessType)], [f.market, marketName || none], [f.stall, data.stall], [f.years, pick(o.years, data.years)], [f.dailySales, pick(o.sales, data.dailySales)]] },
    { step: 3, rows: [[f.product, isProductId(data.product) ? t.products[data.product].name : none], [f.tenor, tenor ? `${tenor.periods} ${unit}` : none], [f.amount, formatNaira(data.amount)], [f.purpose, pick(o.purpose, data.purpose)]] },
    { step: 4, rows: [[f.idType, pick(o.idType, data.idType)], [f.bvn, data.bvn ? `•••••••${data.bvn.slice(-4)}` : none], [f.guarantorName, data.guarantorName], [f.guarantorPhone, data.guarantorPhone]] },
  ];

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <section key={g.step} className="rounded-2xl border-2 border-line p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">{t.apply.steps[g.step - 1]}</h3>
            <button type="button" onClick={() => onEdit(g.step)} className="btn-ghost min-h-12 px-3 text-sm">{t.apply.review.edit}<span className="sr-only">: {t.apply.steps[g.step - 1]}</span></button>
          </div>
          <dl className="mt-2 space-y-1 text-base">
            {g.rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[1fr_1.2fr] gap-2"><dt className="text-ink-soft">{k}</dt><dd className="font-semibold break-words">{v || none}</dd></div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
