import { AlertTriangle, BarChart3, Briefcase, ShieldCheck, TrendingUp } from "lucide-react";
import { investorNotes } from "@/config/products";
import { getDictionary, pickDict } from "@/lib/i18n";
import { formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { I18nScope } from "@/components/I18nProvider";
import { SimpleForm } from "@/components/forms/SimpleForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "investors", "/investors", "Private investment notes funding working capital for market traders in Ibadan. Capital at risk.");
}

/** Formal, separate visual treatment (indigo + white) — distinct from the customer pages. */
export default async function InvestorsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const i = t.investors;
  const Disclaimer = (
    <aside className="rounded-xl border-2 border-indigo bg-white p-5 text-base" aria-labelledby="risk-title">
      <h2 id="risk-title" className="flex items-center gap-2 font-extrabold text-indigo"><AlertTriangle className="h-5 w-5" aria-hidden="true" />{i.disclaimerTitle}</h2>
      <p className="mt-2 text-ink-soft">{i.disclaimer}</p>
    </aside>
  );

  return (
    <div className="bg-white">
      <header className="bg-indigo text-white">
        <div className="container-page py-12 sm:py-16">
          <p className="text-sm font-bold tracking-[0.25em] text-gold uppercase">Lubarsch Credit</p>
          <h1 className="h1 mt-2 max-w-3xl">{i.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">{i.sub}</p>
        </div>
      </header>

      <div className="container-page py-8">{Disclaimer}</div>

      <section className="container-page grid gap-10 pb-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <div>
            <h2 className="h2 text-indigo">{i.whyTitle}</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-lg">{i.why.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>

          <div>
            <h2 className="h2 text-indigo">{i.notesTitle}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-line p-5">
                <dt className="flex items-center gap-2 text-sm font-bold text-ink-soft uppercase"><TrendingUp className="h-4 w-4" aria-hidden="true" />{i.baseline}</dt>
                <dd className="mt-1 text-3xl font-extrabold text-indigo">{formatPercent(investorNotes.baselineAnnualReturn)}</dd>
                <dd className="text-sm text-ink-soft">{i.perAnnum}</dd>
              </div>
              <div className="rounded-xl border border-line p-5">
                <dt className="text-sm font-bold text-ink-soft uppercase">{i.tenors}</dt>
                <dd className="mt-1 text-xl font-extrabold text-indigo">{investorNotes.tenorsMonths.join(", ")}</dd>
                <dd className="text-sm text-ink-soft">{i.months}</dd>
              </div>
              <div className="rounded-xl border border-line p-5">
                <dt className="text-sm font-bold text-ink-soft uppercase">{i.minimum}</dt>
                <dd className="mt-1 text-3xl font-extrabold text-indigo">{investorNotes.minimumTenorMonths}</dd>
                <dd className="text-sm text-ink-soft">{i.months}</dd>
              </div>
            </dl>
            <p className="mt-3 text-base text-ink-soft italic">{i.baselineNote}</p>
          </div>

          {[
            { icon: Briefcase, title: i.useTitle, items: i.use },
            { icon: ShieldCheck, title: i.riskTitle, items: i.risk },
          ].map(({ icon: Icon, title, items }) => (
            <div key={title}>
              <h2 className="h2 flex items-center gap-2 text-indigo"><Icon className="h-7 w-7" aria-hidden="true" />{title}</h2>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-lg">{items.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          ))}

          <div>
            <h2 className="h2 flex items-center gap-2 text-indigo"><BarChart3 className="h-7 w-7" aria-hidden="true" />{i.reportingTitle}</h2>
            <p className="mt-4 text-lg">{i.reporting}</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border-2 border-indigo p-6">
            <h2 className="h3 text-indigo">{i.formTitle}</h2>
            <div className="mt-4">
              <I18nScope dict={pickDict(t, ["investors"])}>
                <SimpleForm kind="investor" submitLabel={i.send} successText={i.sent}
                  fields={[
                    { name: "name", type: "text", label: i.name, required: true, autoComplete: "name" },
                    { name: "email", type: "email", label: i.email, required: true },
                    { name: "phone", type: "tel", label: i.phone },
                    { name: "amountRange", type: "select", label: i.amountRange, required: true, options: Object.entries(i.amounts).map(([value, label]) => ({ value, label })) },
                    { name: "tenor", type: "select", label: i.preferredTenor, required: true, options: investorNotes.tenorsMonths.map((m) => ({ value: String(m), label: `${m} ${i.months}` })) },
                  ]} />
              </I18nScope>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page pb-16">{Disclaimer}</div>
    </div>
  );
}
