import { lending, productList } from "@/config/products";
import { getDictionary } from "@/lib/i18n";
import { formatNaira, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { TrustStrip } from "@/components/ui/TrustStrip";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "loans", "/loans");
}

export default async function LoansPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const o = t.products.overview;

  const rows: { label: string; values: string[] }[] = [
    { label: o.tenors, values: productList.map((p) => p.tenors.map((x) => `${x.periods} ${p.period === "day" ? t.common.days : t.common.weeks}`).join(", ")) },
    { label: o.repayment, values: productList.map((p) => t.products[p.id].repayment) },
    {
      label: o.interest,
      values: productList.map((p) => {
        const unit = p.period === "day" ? t.common.days : t.common.weeks;
        const r = p.tenors.map((x) => (x.interestRate === null ? `${t.common.rateTbc}` : `${formatPercent(x.interestRate)} (${x.periods} ${unit})`));
        const unique = [...new Set(r)];
        return `${unique.join(", ")} — ${p.interestTiming === "upfront" ? o.upfront : o.inRepayments}`;
      }),
    },
    { label: o.adminFee, values: productList.map(() => `${formatNaira(lending.adminFee)} ${o.flatUpfront}`) },
    { label: o.amount, values: productList.map((p) => `${formatNaira(p.minAmount)} – ${formatNaira(p.maxAmount)}${p.limitsConfirmed ? "" : "*"}`) },
    { label: o.bestFor, values: productList.map((p) => t.products[p.id].bestFor) },
  ];

  return (
    <>
      <PageHeader title={o.title} sub={o.sub} />
      <section className="container-page section">
        <div className="grid gap-5 md:grid-cols-2">
          <ProductCard id="daily" t={t} forText={t.products.daily.who} />
          <ProductCard id="weekly" t={t} forText={t.products.weekly.who} />
        </div>

        <h2 className="h2 mt-14">{o.compare}</h2>
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[36rem] text-left text-base">
            <thead className="bg-brand text-white">
              <tr>
                <th scope="col" className="p-4">{o.feature}</th>
                {productList.map((p) => <th key={p.id} scope="col" className="p-4">{t.products[p.id].name}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="bg-cream p-4 font-bold">{row.label}</th>
                  {row.values.map((v, i) => <td key={i} className="p-4">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {productList.some((p) => !p.limitsConfirmed) && <p className="hint mt-2">* {t.common.indicative}</p>}
      </section>
      <TrustStrip t={t} />
      <CtaBand t={t} />
    </>
  );
}
