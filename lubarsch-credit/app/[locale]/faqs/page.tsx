import { getDictionary, pickDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { I18nScope } from "@/components/I18nProvider";
import { FaqSearch } from "@/components/FaqSearch";
import { CtaBand } from "@/components/ui/CtaBand";
import { JsonLd } from "@/components/ui/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "faqs", "/faqs");
}

export default async function FaqsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.faqs.title} sub={t.faqs.sub} />
      <section className="container-page section">
        <I18nScope dict={pickDict(t, ["faqs"])}><FaqSearch /></I18nScope>
      </section>
      <CtaBand t={t} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: t.faqs.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
      }} />
    </>
  );
}
