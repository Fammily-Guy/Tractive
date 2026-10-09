import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { site } from "@/config/site";
import { getDictionary, pickDict, sharedClientKeys } from "@/lib/i18n";
import { isLocale, localeLabels, locales } from "@/lib/i18n-config";
import { financialServiceSchema } from "@/lib/seo";
import { I18nProvider } from "@/components/I18nProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import { JsonLd } from "@/components/ui/JsonLd";

const nunito = Nunito({
  subsets: ["latin", "latin-ext", "vietnamese"], // latin-ext + vietnamese cover most Yoruba diacritics
  display: "swap",
  variable: "--font-nunito",
});

export const viewport: Viewport = {
  themeColor: "#0f5c3a",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} — ${t.meta.home}`, template: `%s | ${site.name}` },
    description: t.meta.siteDescription,
    applicationName: site.name,
    keywords: ["small business loan Ibadan", "daily loan for traders Ibadan", "market women loan Oyo", "weekly loan Ibadan", "microfinance Ibadan"],
    appleWebApp: { capable: true, title: "Lubarsch", statusBarStyle: "default" },
    icons: { apple: "/icons/apple-touch-icon.png" },
    formatDetection: { telephone: true },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <html lang={localeLabels[locale].htmlLang} className={nunito.variable}>
      <body className="min-h-screen antialiased">
        <I18nProvider dict={pickDict(t, sharedClientKeys)} locale={locale}>
          <Header t={t} />
          <main id="main" className="pb-20 lg:pb-0">{children}</main>
          <Footer t={t} />
          <FloatingWhatsApp t={t} />
          <MobileBottomBar t={t} />
          <ConsentBanner />
          <ServiceWorker />
        </I18nProvider>
        <JsonLd data={financialServiceSchema()} />
      </body>
    </html>
  );
}
