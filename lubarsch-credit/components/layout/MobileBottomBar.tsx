import Link from "next/link";
import { Calculator, FileText, Phone } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import type { Dict } from "@/lib/i18n";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function MobileBottomBar({ t }: { t: Dict }) {
  const item = "flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-sm font-bold";
  return (
    <nav aria-label="Quick actions" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="flex">
        <li className="flex flex-1"><a href={site.phoneHref} className={`${item} text-brand`}><Phone className="h-6 w-6" aria-hidden="true" />{t.bottomBar.call}</a></li>
        <li className="flex flex-1"><a href={whatsappLink(t.whatsapp.default)} target="_blank" rel="noopener noreferrer" className={`${item} text-[#1a7f45]`}><WhatsAppIcon className="h-6 w-6" aria-hidden="true" />{t.bottomBar.whatsapp}</a></li>
        <li className="flex flex-1"><Link href="/apply" className={`${item} bg-brand text-white`}><FileText className="h-6 w-6" aria-hidden="true" />{t.bottomBar.apply}</Link></li>
        <li className="flex flex-1"><Link href="/calculator" className={`${item} text-brand`}><Calculator className="h-6 w-6" aria-hidden="true" />{t.bottomBar.calculator}</Link></li>
      </ul>
    </nav>
  );
}
