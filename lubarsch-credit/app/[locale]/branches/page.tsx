import { CalendarDays, Clock, MapPin, Navigation, Phone } from "lucide-react";
import { site } from "@/config/site";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { markets } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { LazyEmbed } from "@/components/LazyEmbed";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "branches", "/branches");
}

export default async function BranchesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const { lat, lng } = site.address;
  const d = 0.01;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <>
      <PageHeader title={t.branches.title} sub={t.branches.sub} />
      <section className="container-page section grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="h3">{t.branches.office}</h2>
          <ul className="mt-4 space-y-4 text-lg">
            <li className="flex gap-3"><MapPin className="mt-1 h-6 w-6 shrink-0 text-brand" aria-hidden="true" /><address className="not-italic">{site.address.street}<br />{site.address.area}, {site.address.city}<br />{site.address.state}</address></li>
            <li className="flex gap-3"><Clock className="mt-1 h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
              <ul>{site.openingHours.map((h) => <li key={h.days}><strong>{h.days}</strong> {h.opens} – {h.closes}</li>)}</ul>
            </li>
            <li><a href={site.phoneHref} className="flex min-h-12 items-center gap-3 font-bold text-brand"><Phone className="h-6 w-6" aria-hidden="true" />{site.phone}</a></li>
          </ul>
          <a href={directions} target="_blank" rel="noopener noreferrer" className="btn-outline mt-4"><Navigation className="h-5 w-5" aria-hidden="true" />{t.branches.directions}</a>
        </div>
        <LazyEmbed kind="map" src={mapSrc} title={t.branches.office} buttonLabel={t.branches.map} note={t.branches.mapNote} />
      </section>

      <section className="bg-sand/60">
        <div className="container-page section">
          <h2 className="h2">{t.branches.marketsTitle}</h2>
          <p className="lead mt-2">{t.branches.marketsSub}</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map((m) => (
              <li key={m.id} className="card">
                <h3 className="h3 flex items-center gap-2"><MapPin className="h-5 w-5 text-brand" aria-hidden="true" />{m.name}</h3>
                <p className="text-ink-soft">{m.area}</p>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-base">
                  <CalendarDays className="h-5 w-5 text-gold-dark" aria-hidden="true" /><span className="font-bold">{t.branches.visitDays}:</span>
                  {m.visitDays.map((day) => <span key={day} className="rounded-full bg-brand-light px-3 py-0.5 font-bold text-brand">{day}</span>)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand t={t} />
    </>
  );
}
