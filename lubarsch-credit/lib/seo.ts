import type { Metadata } from "next";
import { site } from "@/config/site";
import { getDictionary } from "./i18n";
import { localeLabels, locales, type Locale } from "./i18n-config";

type MetaKey = keyof ReturnType<typeof getDictionary>["meta"];

export function pageMetadata(locale: Locale, key: MetaKey, path: string, description?: string): Metadata {
  const t = getDictionary(locale);
  const title = t.meta[key];
  const desc = description ?? t.meta.siteDescription;
  const url = `${site.url}${path === "/" ? "" : path}`;
  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [localeLabels[l].htmlLang, l === "en" ? url : `${site.url}/${l}${path === "/" ? "" : path}`]),
      ),
    },
    openGraph: {
      title: `${title} | ${site.name}`,
      description: desc,
      url,
      siteName: site.name,
      locale: localeLabels[locale].htmlLang.replace("-", "_"),
      type: "website",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description: desc, images: ["/og.jpg"] },
  };
}

/** Local business schema (FinancialService) for Ibadan. */
export function financialServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: site.name,
    url: site.url,
    logo: `${site.url}/icons/icon-512.png`,
    image: `${site.url}/og.jpg`,
    telephone: site.phone,
    email: site.email,
    priceRange: "₦₦",
    description: "Daily and weekly working-capital loans for market women and small traders in Ibadan, Oyo State.",
    areaServed: { "@type": "City", name: "Ibadan" },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.postalCode || undefined,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.address.lat, longitude: site.address.lng },
    openingHoursSpecification: site.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.schema,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: Object.values(site.social).filter(Boolean),
  };
}
