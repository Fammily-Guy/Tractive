import { BadgeCheck, MapPin, Receipt, ShieldCheck } from "lucide-react";
import type { Dict } from "@/lib/i18n";

export function TrustStrip({ t, className = "" }: { t: Dict; className?: string }) {
  const items = [
    { icon: ShieldCheck, label: t.trust.noHarassment },
    { icon: BadgeCheck, label: t.trust.realOfficers },
    { icon: Receipt, label: t.trust.clearFees },
    { icon: MapPin, label: t.trust.ibadan },
  ];
  return (
    <section aria-label="Our promise" className={`bg-brand text-white ${className}`}>
      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-3 py-5 sm:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-base font-bold leading-snug">
            <Icon className="h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
