import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import { getDictionary, pickDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { CALL_TIMES, LANGS } from "@/lib/validation";
import { PageHeader } from "@/components/ui/PageHeader";
import { I18nScope } from "@/components/I18nProvider";
import { SimpleForm } from "@/components/forms/SimpleForm";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "contact", "/contact");
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const c = t.contact;
  return (
    <>
      <PageHeader title={c.title} sub={c.sub} />
      <section className="container-page section grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <a href={site.phoneHref} className="card flex min-h-12 items-center gap-4 hover:ring-2 hover:ring-brand">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white"><Phone className="h-7 w-7" aria-hidden="true" /></span>
            <span><span className="block text-sm font-bold text-ink-soft">{t.common.callUs}</span><span className="text-xl font-extrabold">{site.phone}</span></span>
          </a>
          <a href={whatsappLink(t.whatsapp.default)} target="_blank" rel="noopener noreferrer" className="card flex min-h-12 items-center gap-4 hover:ring-2 hover:ring-brand">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a7f45] text-white"><WhatsAppIcon className="h-7 w-7" aria-hidden="true" /></span>
            <span><span className="block text-sm font-bold text-ink-soft">WhatsApp</span><span className="text-xl font-extrabold">{t.common.whatsappUs}</span></span>
          </a>
          <a href={`mailto:${site.email}`} className="card flex min-h-12 items-center gap-4 hover:ring-2 hover:ring-brand">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink"><Mail className="h-7 w-7" aria-hidden="true" /></span>
            <span><span className="block text-sm font-bold text-ink-soft">{t.common.email}</span><span className="text-lg font-extrabold break-all">{site.email}</span></span>
          </a>
          <div className="card space-y-3">
            <p className="flex gap-3"><MapPin className="mt-1 h-6 w-6 shrink-0 text-brand" aria-hidden="true" /><span><strong>{t.common.address}:</strong> {site.address.street}, {site.address.area}, {site.address.city}, {site.address.state}</span></p>
            <p className="flex gap-3"><Clock className="mt-1 h-6 w-6 shrink-0 text-brand" aria-hidden="true" /><span><strong>{t.common.openingHours}:</strong> {site.openingHours.map((h) => `${h.days} ${h.opens}–${h.closes}`).join(" · ")}</span></p>
          </div>
        </div>

        <I18nScope dict={pickDict(t, ["contact"])}>
          <div className="space-y-6">
            <div className="card border-t-8 border-gold sm:p-8">
              <h2 className="h2">{c.callbackTitle}</h2>
              <p className="mt-1 text-ink-soft">{c.callbackSub}</p>
              <div className="mt-5">
                <SimpleForm kind="callback" submitLabel={c.callMe} successText={c.callbackSent} initial={{ language: locale }}
                  fields={[
                    { name: "name", type: "text", label: c.name, required: true, autoComplete: "name" },
                    { name: "phone", type: "tel", label: c.phone, required: true },
                    { name: "bestTime", type: "radio", label: c.bestTime, required: true, options: CALL_TIMES.map((v) => ({ value: v, label: c.times[v] })) },
                    { name: "language", type: "radio", label: c.language, required: true, columns: 3, options: LANGS.map((v) => ({ value: v, label: t.apply.options.language[v] })) },
                  ]} />
              </div>
            </div>
            <div className="card sm:p-8">
              <h2 className="h2">{c.messageTitle}</h2>
              <div className="mt-5">
                <SimpleForm kind="message" submitLabel={c.send} successText={c.messageSent}
                  fields={[
                    { name: "name", type: "text", label: c.name, required: true, autoComplete: "name" },
                    { name: "phone", type: "tel", label: c.phone },
                    { name: "email", type: "email", label: c.email },
                    { name: "message", type: "textarea", label: c.message, required: true },
                  ]} />
              </div>
            </div>
          </div>
        </I18nScope>
      </section>
    </>
  );
}
