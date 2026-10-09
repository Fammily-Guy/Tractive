import { whatsappLink } from "@/config/site";
import type { Dict } from "@/lib/i18n";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

/** Desktop/tablet floating button. On phones the bottom bar carries WhatsApp instead, so nothing covers page content. */
export function FloatingWhatsApp({ t }: { t: Dict }) {
  return (
    <a
      href={whatsappLink(t.whatsapp.default)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-6 z-30 hidden h-14 w-14 items-center justify-center rounded-full bg-[#1a7f45] text-white shadow-lg ring-4 ring-white hover:bg-[#136135] lg:flex"
    >
      <WhatsAppIcon className="h-7 w-7" aria-hidden="true" />
      <span className="sr-only">{t.whatsapp.floating}</span>
    </a>
  );
}
