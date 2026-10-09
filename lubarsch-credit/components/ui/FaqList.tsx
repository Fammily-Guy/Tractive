import { ChevronDown } from "lucide-react";

/** No-JS accordion using <details>. */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown className="h-6 w-6 shrink-0 text-brand transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="px-5 pb-5 text-base text-ink-soft">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
