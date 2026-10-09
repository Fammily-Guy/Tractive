"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CalendarDays } from "lucide-react";
import { products, type ProductId } from "@/config/products";
import { calculateQuote } from "@/lib/calculator";
import { formatNaira, formatNumber, formatPercent } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

interface Props {
  initialProduct?: ProductId;
  initialAmount?: number;
  /** Lock to a single product (product pages) */
  lockProduct?: boolean;
  compact?: boolean;
}

export function LoanCalculator({ initialProduct = "daily", initialAmount = 50_000, lockProduct = false, compact = false }: Props) {
  const { dict: t } = useI18n();
  const uid = useId();
  const [productId, setProductId] = useState<ProductId>(initialProduct);
  const product = products[productId];
  const [tenorId, setTenorId] = useState(product.tenors[0].id);
  const [amount, setAmount] = useState(clamp(initialAmount, product.minAmount, product.maxAmount));
  const [rawInput, setRawInput] = useState<string | null>(null);

  const result = useMemo(() => calculateQuote(productId, tenorId, amount), [productId, tenorId, amount]);
  const periodWord = product.period === "day" ? t.common.day : t.common.week;

  function chooseProduct(id: ProductId) {
    setProductId(id);
    const p = products[id];
    setTenorId(p.tenors[0].id);
    setAmount((a) => clamp(a, p.minAmount, p.maxAmount));
    setRawInput(null);
  }

  function tenorLabel(periods: number) {
    return `${periods} ${product.period === "day" ? t.common.days : t.common.weeks}`;
  }

  const errorText = !result.ok
    ? fill(t.calculator.errors[result.error], { min: formatNaira(product.minAmount), max: formatNaira(product.maxAmount) })
    : null;

  return (
    <div className={`card ${compact ? "" : "sm:p-8"}`}>
      <div className={`grid gap-6 ${compact ? "lg:grid-cols-2" : "lg:grid-cols-[1fr_1fr]"}`}>
        {/* ── Inputs ───────────────────────── */}
        <div className="space-y-6">
          <div>
            <label htmlFor={`${uid}-amount`} className="label text-lg">{t.calculator.amount}</label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-2xl font-extrabold text-brand" aria-hidden="true">₦</span>
              <input
                id={`${uid}-amount`}
                inputMode="numeric"
                autoComplete="off"
                className="input pl-10 text-2xl font-extrabold"
                value={rawInput ?? formatNumber(amount)}
                aria-describedby={`${uid}-amount-hint`}
                aria-invalid={!result.ok && (result.error === "below-min" || result.error === "above-max")}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                  setRawInput(digits ? formatNumber(Number(digits)) : "");
                  setAmount(Number(digits || 0));
                }}
                onBlur={() => setRawInput(null)}
              />
            </div>
            <input
              type="range"
              min={product.minAmount}
              max={product.maxAmount}
              step={product.step}
              value={clamp(amount, product.minAmount, product.maxAmount)}
              onChange={(e) => { setAmount(Number(e.target.value)); setRawInput(null); }}
              aria-label={t.calculator.amount}
              aria-valuetext={formatNaira(amount)}
              className="mt-4 h-12 w-full cursor-pointer accent-[var(--color-brand)]"
            />
            <p id={`${uid}-amount-hint`} className="hint flex justify-between">
              <span>{formatNaira(product.minAmount)}</span>
              <span>{formatNaira(product.maxAmount)}</span>
            </p>
            {!product.limitsConfirmed && <p className="hint italic">{t.common.indicative}</p>}
          </div>

          {!lockProduct && (
            <fieldset>
              <legend className="label text-lg">{t.calculator.product}</legend>
              <div className="grid grid-cols-2 gap-3">
                {(["daily", "weekly"] as const).map((id) => (
                  <label key={id} className="choice justify-center text-center">
                    <input type="radio" name={`${uid}-product`} className="sr-only" checked={productId === id} onChange={() => chooseProduct(id)} />
                    {id === "daily" ? <CalendarDays className="h-5 w-5 text-brand" aria-hidden="true" /> : <CalendarClock className="h-5 w-5 text-brand" aria-hidden="true" />}
                    {t.products[id].name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className="label text-lg">{t.calculator.tenor}</legend>
            <div className="grid grid-cols-2 gap-3">
              {product.tenors.map((tenor) => (
                <label key={tenor.id} className="choice justify-center">
                  <input type="radio" name={`${uid}-tenor`} className="sr-only" checked={tenorId === tenor.id} onChange={() => setTenorId(tenor.id)} />
                  {tenorLabel(tenor.periods)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* ── Results ──────────────────────── */}
        <div className="-mx-1 rounded-2xl bg-brand-light p-4 sm:mx-0 sm:p-5" aria-live="polite">
          <h3 className="text-lg font-extrabold text-brand-dark">{t.calculator.results}</h3>
          {result.ok ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3 sm:p-4">
                  <p className="text-sm font-bold text-ink-soft">{t.calculator.cashToday}</p>
                  <p className="text-xl font-extrabold text-brand sm:text-2xl" data-testid="cash-today">{formatNaira(result.quote.cashReceived)}</p>
                </div>
                <div className="rounded-xl bg-gold-light p-3 sm:p-4">
                  <p className="text-sm font-bold text-ink-soft">{fill(t.calculator.payEach, { period: periodWord })}</p>
                  <p className="text-xl font-extrabold text-gold-dark sm:text-2xl" data-testid="instalment">{formatNaira(result.quote.instalment)}</p>
                </div>
              </div>
              <dl className="mt-4 divide-y divide-line/70 text-base">
                <Row label={t.calculator.asked} value={formatNaira(result.quote.principal)} />
                <Row label={t.calculator.adminFee} value={`− ${formatNaira(result.quote.adminFee)}`} />
                <Row
                  label={`${t.calculator.interest} (${formatPercent(result.quote.interestRate)}, ${result.quote.interestTiming === "upfront" ? t.calculator.interestUpfront : t.calculator.interestInRepay})`}
                  value={result.quote.interestTiming === "upfront" ? `− ${formatNaira(result.quote.interest)}` : formatNaira(result.quote.interest)}
                />
                <Row label={t.calculator.numPayments} value={String(result.quote.numberOfPayments)} />
                <Row label={t.calculator.totalBack} value={formatNaira(result.quote.totalRepaid)} strong />
                {!compact && <Row label={t.calculator.totalCost} value={formatNaira(result.quote.totalCost)} />}
              </dl>
              <p className="mt-4 rounded-xl bg-white p-3 text-base font-semibold" data-testid="sentence">
                {fill(product.period === "day" ? t.calculator.sentenceDaily : t.calculator.sentenceWeekly, {
                  principal: formatNaira(result.quote.principal),
                  cash: formatNaira(result.quote.cashReceived),
                  instalment: formatNaira(result.quote.instalment),
                  n: result.quote.numberOfPayments,
                })}
              </p>
              <Link
                href={`/apply?product=${productId}&tenor=${tenorId}&amount=${amount}`}
                className="btn-primary mt-4 w-full"
              >
                {t.calculator.applyWith}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-white p-4 text-base font-semibold" role="status">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" aria-hidden="true" />
              {errorText}
            </p>
          )}
          <p className="mt-3 text-sm text-ink-soft">{t.calculator.smallPrint}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 py-2 ${strong ? "font-extrabold" : ""}`}>
      <dt className="text-ink-soft">{label}</dt>
      <dd className="shrink-0 font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}
