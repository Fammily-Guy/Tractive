import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { ProductDetail } from "@/components/ProductDetail";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "daily", "/loans/daily", getDictionary(locale).products.daily.who);
}

export default async function DailyLoanPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <ProductDetail id="daily" t={getDictionary(locale)} />;
}
