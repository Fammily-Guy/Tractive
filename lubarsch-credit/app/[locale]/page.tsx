import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Camera, FileText, Fingerprint, HandCoins, IdCard, MapPin, Store, UserCheck, Users } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import { getDictionary } from "@/lib/i18n";
import { formatNaira, formatNumber } from "@/lib/format";
import { impact, markets, stories } from "@/lib/content";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { TrustStrip } from "@/components/ui/TrustStrip";
import { ProductCard } from "@/components/ui/ProductCard";
import { LoanCalculator } from "@/components/LoanCalculator";
import { StoryCard } from "@/components/ui/StoryCard";
import { FaqList } from "@/components/ui/FaqList";
import { CtaBand } from "@/components/ui/CtaBand";
import { AdireBackground, AdireDivider } from "@/components/ui/AdireDivider";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "home", "/");
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const stepIcons = [FileText, Store, HandCoins, BadgeCheck];
  const needIcons = [IdCard, Camera, Fingerprint, MapPin, UserCheck];
  const impactItems = [
    { label: t.home.impact.customers, value: impact.customers === null ? null : formatNumber(impact.customers) },
    { label: t.home.impact.disbursed, value: impact.disbursed === null ? null : formatNaira(impact.disbursed) },
    { label: t.home.impact.markets, value: impact.markets === null ? null : formatNumber(impact.markets) },
    { label: t.home.impact.repayment, value: impact.repaymentRate === null ? null : `${impact.repaymentRate}%` },
  ];

  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-brand-light">
        <AdireBackground className="text-brand/10" />
        <div className="container-page relative grid items-center gap-8 py-8 sm:py-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-3 inline-block rounded-full bg-gold-light px-3 py-1 text-sm font-extrabold text-gold-dark">{t.brand.taglines[site.taglineKey]}</p>
            <h1 className="h1 text-brand-dark">{t.home.hero.title}</h1>
            <p className="lead mt-4 max-w-xl">{t.home.hero.sub}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/apply" className="btn-primary text-lg"><FileText className="h-5 w-5" aria-hidden="true" />{t.common.getLoan}</Link>
              <a href={whatsappLink(t.whatsapp.default)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp text-lg"><WhatsAppIcon className="h-5 w-5" aria-hidden="true" />{t.common.whatsappUs}</a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-4 border-white shadow-[var(--shadow-card)]">
            <Image src="/images/placeholder-hero.jpg" alt={t.home.hero.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* 2. Trust strip */}
      <TrustStrip t={t} />

      {/* 3. Products */}
      <section className="container-page section">
        <h2 className="h2">{t.home.products.title}</h2>
        <p className="lead mt-2">{t.home.products.sub}</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ProductCard id="daily" t={t} forText={t.home.products.dailyFor} />
          <ProductCard id="weekly" t={t} forText={t.home.products.weeklyFor} />
        </div>
      </section>

      {/* 4. Mini calculator */}
      <section className="bg-sand/60" id="calculator">
        <div className="container-page section">
          <h2 className="h2">{t.home.calc.title}</h2>
          <p className="lead mt-2">{t.home.calc.sub}</p>
          <div className="mt-6"><LoanCalculator compact /></div>
        </div>
      </section>

      {/* 5. How it works */}
      <section className="container-page section">
        <h2 className="h2">{t.home.how.title}</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.how.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <li key={step.title} className="card relative">
                <span className="absolute top-4 right-4 text-4xl font-extrabold text-gold/40" aria-hidden="true">{i + 1}</span>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white"><Icon className="h-7 w-7" aria-hidden="true" /></span>
                <h3 className="h3 mt-4">{step.title}</h3>
                <p className="mt-1 text-ink-soft">{step.text}</p>
              </li>
            );
          })}
        </ol>
        <Link href="/how-it-works" className="btn-ghost mt-4">{t.common.learnMore} →</Link>
      </section>

      <AdireDivider />

      {/* 6. What you need */}
      <section className="container-page section">
        <h2 className="h2">{t.home.needs.title}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {t.home.needs.items.map((item, i) => {
            const Icon = needIcons[i] ?? BadgeCheck;
            return (
              <li key={item} className="flex items-center gap-4 rounded-2xl border-2 border-line bg-white p-4 text-base font-semibold">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-light"><Icon className="h-6 w-6 text-gold-dark" aria-hidden="true" /></span>
                {item}
              </li>
            );
          })}
        </ul>
      </section>

      {/* 7. Stories */}
      {stories.length > 0 && (
        <section className="bg-sand/60">
          <div className="container-page section">
            <h2 className="h2">{t.home.stories.title}</h2>
            <p className="lead mt-2">{t.home.stories.sub}</p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {stories.slice(0, 3).map((s) => <StoryCard key={s.id} story={s} placeholderLabel={t.common.placeholder} />)}
            </div>
            <Link href="/stories" className="btn-ghost mt-4">{t.common.seeAll} →</Link>
          </div>
        </section>
      )}

      {/* 8. Impact */}
      <section className="container-page section">
        <h2 className="h2">{t.home.impact.title}</h2>
        <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {impactItems.map((item) => (
            <div key={item.label} className="card flex flex-col text-center">
              <dt className="text-base font-semibold text-ink-soft">{item.label}</dt>
              <dd className={`order-first text-3xl font-extrabold ${item.value ? "text-brand" : "text-ink-soft"}`}>{item.value ?? "—"}</dd>
              {!item.value && <dd className="mt-1 text-xs font-bold text-gold-dark uppercase">{t.common.comingSoon}</dd>}
            </div>
          ))}
        </dl>
      </section>

      {/* 9. Markets */}
      <section className="bg-brand-light">
        <div className="container-page section">
          <h2 className="h2 flex items-center gap-2"><Users className="h-8 w-8 text-brand" aria-hidden="true" />{t.home.markets.title}</h2>
          <p className="lead mt-2">{t.home.markets.sub}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {markets.map((m) => (
              <li key={m.id} className="chip"><MapPin className="h-4 w-4 text-brand" aria-hidden="true" />{m.name}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 10. FAQ preview */}
      <section className="container-page section">
        <h2 className="h2">{t.home.faq.title}</h2>
        <div className="mt-6"><FaqList items={[0, 1, 2, 5, 10].map((i) => t.faqs.items[i])} /></div>
        <Link href="/faqs" className="btn-outline mt-6">{t.home.faq.all}</Link>
      </section>

      {/* 11. Final CTA */}
      <CtaBand t={t} />
    </>
  );
}
