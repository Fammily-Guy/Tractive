import Image from "next/image";
import { Check, Star } from "lucide-react";
import { getDictionary, pickDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { I18nScope } from "@/components/I18nProvider";
import { SimpleForm } from "@/components/forms/SimpleForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "agent", "/become-an-agent");
}

export default async function AgentPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const a = t.agent;
  return (
    <>
      <PageHeader title={a.title} sub={a.sub} />
      <section className="container-page section grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem]">
            <Image src="/images/placeholder-agent.jpg" alt="PLACEHOLDER PHOTO: A Lubarsch field officer wearing an ID card talking with a trader at her stall." fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <h2 className="h2">{a.benefitsTitle}</h2>
            <ul className="mt-4 space-y-3">{a.benefits.map((b) => <li key={b} className="flex gap-3 text-lg"><Star className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />{b}</li>)}</ul>
          </div>
          <div>
            <h2 className="h2">{a.reqTitle}</h2>
            <ul className="mt-4 space-y-3">{a.requirements.map((r) => <li key={r} className="flex gap-3 text-lg"><Check className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />{r}</li>)}</ul>
          </div>
        </div>
        <div className="card self-start border-t-8 border-gold sm:p-8">
          <h2 className="h2">{a.formTitle}</h2>
          <div className="mt-5">
            <I18nScope dict={pickDict(t, ["agent"])}>
              <SimpleForm kind="agent" submitLabel={a.send} successText={a.sent}
                fields={[
                  { name: "name", type: "text", label: t.contact.name, required: true, autoComplete: "name" },
                  { name: "phone", type: "tel", label: t.contact.phone, required: true },
                  { name: "role", type: "radio", label: a.role, required: true, options: Object.entries(a.roles).map(([value, label]) => ({ value, label })) },
                  { name: "markets", type: "text", label: a.markets, required: true },
                  { name: "about", type: "textarea", label: a.experience },
                ]} />
            </I18nScope>
          </div>
        </div>
      </section>
    </>
  );
}
