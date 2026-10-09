import Link from "next/link";
import { BadgeCheck, FileText, HandCoins, HeartHandshake, PhoneCall, Store } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { LazyEmbed } from "@/components/LazyEmbed";
import { CtaBand } from "@/components/ui/CtaBand";
import { TrustStrip } from "@/components/ui/TrustStrip";

// TODO: paste a privacy-friendly embed URL, e.g. https://www.youtube-nocookie.com/embed/VIDEO_ID
const EXPLAINER_VIDEO_URL: string | null = null;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "howItWorks", "/how-it-works");
}

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const icons = [FileText, PhoneCall, Store, HandCoins, BadgeCheck];
  return (
    <>
      <PageHeader title={t.how.title} sub={t.how.sub} />
      <section className="container-page section">
        <ol className="relative mx-auto max-w-3xl space-y-6 border-l-4 border-gold pl-8">
          {t.how.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <li key={step.title} className="relative">
                <span className="absolute top-1 -left-[3.35rem] flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white ring-4 ring-cream">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="card">
                  <p className="text-sm font-extrabold tracking-wider text-gold-dark uppercase">{i + 1} / {t.how.steps.length}</p>
                  <h2 className="h3 mt-1">{step.title}</h2>
                  <p className="mt-1 text-ink-soft">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="bg-sand/60">
        <div className="container-page section mx-auto max-w-3xl">
          <h2 className="h2">{t.how.video}</h2>
          <div className="mt-6">
            <LazyEmbed kind="video" src={EXPLAINER_VIDEO_URL} title={t.how.video} poster="/images/placeholder-video-poster.jpg"
              buttonLabel={EXPLAINER_VIDEO_URL ? t.how.video : t.how.videoPlaceholder} note={t.how.videoNote} />
          </div>
        </div>
      </section>

      <section className="container-page section">
        <div className="mx-auto max-w-3xl rounded-[var(--radius-card)] border-2 border-brand bg-brand-light p-6 sm:p-8">
          <h2 className="h2 flex items-center gap-3"><HeartHandshake className="h-9 w-9 shrink-0 text-brand" aria-hidden="true" />{t.how.missTitle}</h2>
          {t.how.missText.map((p) => <p key={p} className="mt-3 text-lg">{p}</p>)}
          <Link href="/legal/fair-collection" className="btn-primary mt-6">{t.how.readPromise}</Link>
        </div>
      </section>
      <TrustStrip t={t} />
      <CtaBand t={t} />
    </>
  );
}
