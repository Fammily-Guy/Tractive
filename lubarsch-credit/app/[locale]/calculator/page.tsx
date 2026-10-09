import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoanCalculator } from "@/components/LoanCalculator";
import { TrustStrip } from "@/components/ui/TrustStrip";
import { FaqList } from "@/components/ui/FaqList";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "calculator", "/calculator");
}

export default async function CalculatorPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.calculator.title} sub={t.calculator.sub} />
      <section className="container-page section">
        <LoanCalculator />
      </section>
      <TrustStrip t={t} />
      <section className="container-page section">
        <FaqList items={t.faqs.items.filter((f) => f.group === "fees")} />
      </section>
    </>
  );
}
