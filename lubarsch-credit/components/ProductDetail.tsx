import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, Fingerprint, IdCard, MapPin, Percent, Receipt, Repeat, Timer, UserCheck, Wallet } from "lucide-react";
import { lending, products, type ProductId } from "@/config/products";
import { calculateQuote } from "@/lib/calculator";
import { formatNaira, formatPercent } from "@/lib/format";
import { fill, type Dict } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoanCalculator } from "@/components/LoanCalculator";
import { CtaBand } from "@/components/ui/CtaBand";
import { TrustStrip } from "@/components/ui/TrustStrip";

const exampleAmount: Record<ProductId, number> = { daily: 50_000, weekly: 100_000 };

export function ProductDetail({ id, t }: { id: ProductId; t: Dict }) {
  const p = products[id];
  const copy = t.products[id];
  const unit = p.period === "day" ? t.common.days : t.common.weeks;
  const example = Math.min(Math.max(exampleAmount[id], p.minAmount), p.maxAmount);
  const needIcons = [IdCard, Camera, Fingerprint, MapPin, UserCheck];

  const rates = p.tenors
    .map((tn) => (tn.interestRate === null ? `${tn.periods} ${unit}: ${t.common.rateTbc}` : `${formatPercent(tn.interestRate)} (${tn.periods} ${unit})`))
    .join(" · ");

  const facts = [
    { icon: Timer, label: t.products.overview.tenors, value: p.tenors.map((x) => `${x.periods} ${unit}`).join(", ") },
    { icon: Repeat, label: t.products.overview.repayment, value: copy.repayment },
    { icon: Percent, label: t.products.overview.interest, value: `${rates} — ${p.interestTiming === "upfront" ? t.products.overview.upfront : t.products.overview.inRepayments}` },
    { icon: Receipt, label: t.products.overview.adminFee, value: `${formatNaira(lending.adminFee)} ${t.products.overview.flatUpfront}` },
    { icon: Wallet, label: t.products.overview.amount, value: `${formatNaira(p.minAmount)} – ${formatNaira(p.maxAmount)}${p.limitsConfirmed ? "" : ` (${t.common.indicative})`}` },
  ];

  return (
    <>
      <PageHeader title={copy.name} sub={copy.short}>
        <Link href={`/apply?product=${id}`} className="btn-primary mt-6">{t.common.applyNow}<ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
      </PageHeader>

      <section className="container-page section grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="h2">{t.products.page.whoFor}</h2>
          <p className="lead mt-3">{copy.who}</p>
          <p className="mt-4 rounded-2xl bg-gold-light p-4 text-base font-semibold">{copy.interestNote}</p>
        </div>
        <div className="card">
          <h2 className="h3">{t.products.page.details}</h2>
          <dl className="mt-4 space-y-4">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3">
                <Icon className="mt-1 h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
                <div><dt className="font-bold">{label}</dt><dd className="text-ink-soft">{value}</dd></div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-sand/60">
        <div className="container-page section">
          <h2 className="h2">{t.products.page.example}</h2>
          <p className="mt-2 text-ink-soft">{fill(t.products.page.exampleNote, { amount: formatNaira(example) })}</p>
          <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
            <table className="w-full min-w-[32rem] text-left text-base">
              <thead className="bg-brand text-white">
                <tr>
                  <th scope="col" className="p-4">{t.products.page.tenor}</th>
                  <th scope="col" className="p-4">{t.products.page.youReceive}</th>
                  <th scope="col" className="p-4">{t.products.page.youPay}</th>
                  <th scope="col" className="p-4">{t.products.page.payments}</th>
                  <th scope="col" className="p-4">{t.products.page.total}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {p.tenors.map((tn) => {
                  const r = calculateQuote(id, tn.id, example);
                  return (
                    <tr key={tn.id}>
                      <th scope="row" className="p-4 font-bold">{tn.periods} {unit}</th>
                      {r.ok ? (
                        <>
                          <td className="p-4 font-bold text-brand">{formatNaira(r.quote.cashReceived)}</td>
                          <td className="p-4">{formatNaira(r.quote.instalment)} / {p.period === "day" ? t.common.day : t.common.week}</td>
                          <td className="p-4">{r.quote.numberOfPayments}</td>
                          <td className="p-4 font-bold">{formatNaira(r.quote.totalRepaid)}</td>
                        </>
                      ) : (
                        <td colSpan={4} className="p-4 text-ink-soft italic">{t.calculator.errors[r.error]}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <h3 className="h3 mt-10">{t.products.page.tryCalculator}</h3>
          <div className="mt-4"><LoanCalculator initialProduct={id} initialAmount={example} lockProduct /></div>
        </div>
      </section>

      <section className="container-page section">
        <h2 className="h2">{t.products.page.requirements}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {t.home.needs.items.map((item, i) => {
            const Icon = needIcons[i] ?? BadgeCheck;
            return (
              <li key={item} className="flex items-center gap-3 rounded-2xl border-2 border-line bg-white p-4 font-semibold">
                <Icon className="h-6 w-6 shrink-0 text-gold-dark" aria-hidden="true" />{item}
              </li>
            );
          })}
        </ul>
      </section>
      <TrustStrip t={t} />
      <CtaBand t={t} />
    </>
  );
}
