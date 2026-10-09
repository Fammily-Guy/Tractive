import { getDictionary, pickDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { I18nScope } from "@/components/I18nProvider";
import { StatusForm } from "@/components/forms/StatusForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return { ...pageMetadata(locale, "status", "/check-status"), robots: { index: false } };
}

export default async function CheckStatusPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.status.title} sub={t.status.sub} />
      <section className="container-page section">
        <I18nScope dict={pickDict(t, ["status"])}><StatusForm /></I18nScope>
      </section>
    </>
  );
}
