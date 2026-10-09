import Link from "next/link";
import { Suspense } from "react";
import { CircleCheck, ShieldAlert } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { SuccessReference } from "@/components/forms/SuccessReference";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return { ...pageMetadata(locale, "success", "/apply/success"), robots: { index: false } };
}

export default async function SuccessPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <section className="container-page section">
      <div className="card mx-auto max-w-2xl text-center sm:p-10">
        <CircleCheck className="mx-auto h-16 w-16 text-success" aria-hidden="true" />
        <h1 className="h2 mt-4">{t.success.title}</h1>
        <div className="mt-6 rounded-2xl border-2 border-dashed border-brand bg-brand-light p-5">
          <p className="font-bold">{t.success.ref}</p>
          <Suspense fallback={<p className="mt-2 text-3xl">…</p>}><SuccessReference /></Suspense>
          <p className="mt-2 text-base text-ink-soft">{t.success.keep}</p>
        </div>
        <h2 className="h3 mt-8 text-left">{t.success.nextTitle}</h2>
        <ol className="mt-3 space-y-3 text-left">
          {t.success.next.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex gap-2 rounded-xl bg-gold-light p-4 text-left font-semibold">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" aria-hidden="true" />{t.success.warning}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/check-status" className="btn-primary">{t.success.checkStatus}</Link>
          <Link href="/" className="btn-outline">{t.success.home}</Link>
        </div>
      </div>
    </section>
  );
}
