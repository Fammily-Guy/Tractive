import { Suspense } from "react";
import { getDictionary, pickDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { I18nScope } from "@/components/I18nProvider";
import { ApplyForm } from "@/components/forms/ApplyForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "apply", "/apply");
}

export default async function ApplyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.apply.title} sub={t.apply.sub} />
      <section className="container-page section pt-6">
        <I18nScope dict={pickDict(t, ["apply", "meta"])}>
          <Suspense fallback={<div className="card mx-auto h-96 max-w-2xl animate-pulse" />}>
            <ApplyForm />
          </Suspense>
        </I18nScope>
      </section>
    </>
  );
}
