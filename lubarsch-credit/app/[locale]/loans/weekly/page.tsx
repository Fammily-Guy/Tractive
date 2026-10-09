import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { ProductDetail } from "@/components/ProductDetail";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "weekly", "/loans/weekly", getDictionary(locale).products.weekly.who);
}

export default async function WeeklyLoanPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <ProductDetail id="weekly" t={getDictionary(locale)} />;
}
