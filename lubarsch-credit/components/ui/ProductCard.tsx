import Link from "next/link";
import { ArrowRight, CalendarClock, CalendarDays, Repeat, Timer } from "lucide-react";
import { products, type ProductId } from "@/config/products";
import type { Dict } from "@/lib/i18n";

export function ProductCard({ id, t, forText }: { id: ProductId; t: Dict; forText: string }) {
  const p = products[id];
  const unit = p.period === "day" ? t.common.days : t.common.weeks;
  const Icon = id === "daily" ? CalendarDays : CalendarClock;
  return (
    <article className="card flex flex-col border-t-8 border-gold">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light"><Icon className="h-6 w-6 text-brand" aria-hidden="true" /></span>
        <h3 className="h3">{t.products[id].name}</h3>
      </div>
      <p className="mt-3 text-ink-soft">{forText}</p>
      <dl className="mt-4 space-y-2 text-base">
        <div className="flex items-center gap-2"><Timer className="h-5 w-5 text-brand" aria-hidden="true" /><dt className="font-bold">{t.home.products.tenor}:</dt><dd>{p.tenors.map((x) => x.periods).join(" / ")} {unit}</dd></div>
        <div className="flex items-center gap-2"><Repeat className="h-5 w-5 text-brand" aria-hidden="true" /><dt className="font-bold">{t.home.products.repay}:</dt><dd>{t.products[id].repayment}</dd></div>
      </dl>
      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <Link href={`/loans/${id}`} className="btn-outline px-3">{t.common.learnMore}<span className="sr-only">: {t.products[id].name}</span></Link>
        <Link href={`/apply?product=${id}`} className="btn-primary px-3">{t.common.apply}<span className="sr-only">: {t.products[id].name}</span><ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
