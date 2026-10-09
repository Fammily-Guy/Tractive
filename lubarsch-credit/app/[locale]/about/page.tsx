import Image from "next/image";
import { Handshake, Heart, ShieldCheck, Zap } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { team } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "about", "/about");
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const valueIcons = [Heart, ShieldCheck, Zap, Handshake];
  return (
    <>
      <PageHeader title={t.about.title} sub={t.about.sub} />
      <section className="container-page section grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h2 className="h2">{t.about.storyTitle}</h2>
          {t.about.story.map((p) => <p key={p} className="mt-4 text-lg">{p}</p>)}
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] border-4 border-white shadow-[var(--shadow-card)]">
          <Image src="/images/placeholder-office.jpg" alt={t.about.officeAlt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
      </section>

      <section className="bg-brand text-white">
        <div className="container-page section text-center">
          <h2 className="text-sm font-extrabold tracking-[0.2em] text-gold uppercase">{t.about.missionTitle}</h2>
          <p className="mx-auto mt-3 max-w-3xl text-2xl font-extrabold sm:text-3xl">{t.about.mission}</p>
        </div>
      </section>

      <section className="container-page section">
        <h2 className="h2">{t.about.valuesTitle}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.values.map((v, i) => {
            const Icon = valueIcons[i];
            return (
              <li key={v.title} className="card">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-light"><Icon className="h-6 w-6 text-gold-dark" aria-hidden="true" /></span>
                <h3 className="h3 mt-3">{v.title}</h3>
                <p className="mt-1 text-ink-soft">{v.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-sand/60">
        <div className="container-page section">
          <h2 className="h2">{t.about.teamTitle}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {team.map((m, i) => (
              <li key={i} className="card p-0 sm:p-0 overflow-hidden text-center">
                <div className="relative aspect-square bg-sand">
                  <Image src={m.image} alt={`PLACEHOLDER PHOTO: portrait of ${m.role}`} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-extrabold">{m.name}</p>
                  <p className="text-base text-ink-soft">{m.role}</p>
                  {m.name.startsWith("[") && <div className="mt-2"><PlaceholderBadge label={t.common.placeholder} /></div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand t={t} />
    </>
  );
}
