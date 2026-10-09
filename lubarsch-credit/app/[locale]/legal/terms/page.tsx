import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "terms", "/legal/terms");
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <LegalPage name="terms" t={getDictionary(locale)} />;
}
