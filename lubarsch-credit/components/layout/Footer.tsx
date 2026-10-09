import Link from "next/link";
import { Clock, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import type { Dict } from "@/lib/i18n";
import { LogoMark } from "@/components/ui/Logo";
import { AdireDivider } from "@/components/ui/AdireDivider";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function Footer({ t }: { t: Dict }) {
  const year = new Date().getFullYear();
  const cols = [
    {
      title: t.footer.quickLinks,
      links: [
        { href: "/loans/daily", label: t.nav.daily },
        { href: "/loans/weekly", label: t.nav.weekly },
        { href: "/calculator", label: t.nav.calculator },
        { href: "/apply", label: t.common.getLoan },
        { href: "/check-status", label: t.nav.status },
      ],
    },
    {
      title: t.footer.help,
      links: [
        { href: "/how-it-works", label: t.nav.howItWorks },
        { href: "/faqs", label: t.nav.faqs },
        { href: "/contact", label: t.nav.contact },
        { href: "/branches", label: t.nav.branches },
        { href: "/blog", label: t.nav.blog },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: "/about", label: t.nav.about },
        { href: "/stories", label: t.nav.stories },
        { href: "/become-an-agent", label: t.nav.agent },
        { href: "/investors", label: t.nav.investors },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { href: "/legal/privacy", label: t.meta.privacy },
        { href: "/legal/terms", label: t.meta.terms },
        { href: "/legal/fair-collection", label: t.meta.fairCollection },
      ],
    },
  ];
  const social = Object.entries(site.social).filter(([, url]) => url);

  return (
    <footer className="bg-ink pb-24 text-white/90 lg:pb-0">
      <AdireDivider tone="gold" />
      <div className="container-page py-10">
        <div className="rounded-2xl border-2 border-gold bg-white/5 p-4 sm:p-5">
          <p className="flex items-start gap-3 text-base">
            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
            <span>
              <strong className="text-gold">{t.footer.warningTitle}: </strong>
              {t.footer.warning} {t.footer.contactsWarning}
            </span>
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="text-xl font-extrabold text-white">{site.name}</span>
            </div>
            <p className="mt-3 text-white/75">{t.footer.about}</p>
            <ul className="mt-5 space-y-3 text-base">
              <li><a href={site.phoneHref} className="flex min-h-12 items-center gap-3 hover:text-gold"><Phone className="h-5 w-5 text-gold" aria-hidden="true" />{site.phone}</a></li>
              <li><a href={whatsappLink(t.whatsapp.default)} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 hover:text-gold"><WhatsAppIcon className="h-5 w-5 text-gold" aria-hidden="true" />{t.common.whatsappUs}</a></li>
              <li><a href={`mailto:${site.email}`} className="flex min-h-12 items-center gap-3 hover:text-gold"><Mail className="h-5 w-5 text-gold" aria-hidden="true" />{site.email}</a></li>
              <li className="flex items-start gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden="true" /><span>{site.address.street}, {site.address.area}, {site.address.city}, {site.address.state}</span></li>
              <li className="flex items-start gap-3"><Clock className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden="true" /><span>{site.openingHours.map((h) => `${h.days} ${h.opens}–${h.closes}`).join(" · ")}</span></li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {cols.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-sm font-extrabold tracking-wider text-gold uppercase">{col.title}</h2>
                <ul className="mt-3 space-y-1">
                  {col.links.map((l) => (
                    <li key={l.href}><Link href={l.href} className="flex min-h-11 items-center hover:text-gold">{l.label}</Link></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {social.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-3">
            {social.map(([name, url]) => (
              <li key={name}><a href={url} className="chip border-white/30 bg-transparent capitalize text-white" target="_blank" rel="noopener noreferrer">{name}</a></li>
            ))}
          </ul>
        )}

        <div className="mt-10 space-y-2 border-t border-white/15 pt-6 text-sm text-white/70">
          <p data-placeholder="licence">{site.licenceLine}</p>
          <p>© {year} {site.name}. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
