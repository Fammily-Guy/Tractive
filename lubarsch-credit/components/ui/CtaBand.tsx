import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import type { Dict } from "@/lib/i18n";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { AdireBackground } from "./AdireDivider";

export function CtaBand({ t }: { t: Dict }) {
  return (
    <section className="relative overflow-hidden bg-brand-dark text-white">
      <AdireBackground className="text-white/5" />
      <div className="container-page section relative text-center">
        <h2 className="h2">{t.home.cta.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-white/85">{t.home.cta.sub}</p>
        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/apply" className="btn-gold"><FileText className="h-5 w-5" aria-hidden="true" />{t.common.getLoan}</Link>
          <a href={site.phoneHref} className="btn border-2 border-white text-white hover:bg-white/10"><Phone className="h-5 w-5" aria-hidden="true" />{t.common.callUs}</a>
          <a href={whatsappLink(t.whatsapp.default)} className="btn-whatsapp" target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-5 w-5" aria-hidden="true" />{t.common.whatsapp}</a>
        </div>
      </div>
    </section>
  );
}
