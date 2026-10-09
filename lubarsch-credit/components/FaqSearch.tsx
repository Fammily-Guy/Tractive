"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useI18n } from "./I18nProvider";

export function FaqSearch() {
  const { dict: t } = useI18n();
  const [q, setQ] = useState("");
  const groups = Object.entries(t.faqs.groups) as [keyof typeof t.faqs.groups, string][];
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? t.faqs.items.filter((i) => `${i.q} ${i.a}`.toLowerCase().includes(s)) : t.faqs.items;
  }, [q, t.faqs.items]);

  return (
    <div className="mx-auto max-w-3xl">
      <label htmlFor="faq-search" className="label">{t.faqs.search}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
        <input id="faq-search" type="search" className="input pl-12" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div aria-live="polite">
        {filtered.length === 0 && <p className="mt-6 rounded-xl bg-gold-light p-4 font-semibold">{t.faqs.noResults}</p>}
        {groups.map(([key, label]) => {
          const items = filtered.filter((i) => i.group === key);
          if (!items.length) return null;
          return (
            <section key={key} className="mt-8">
              <h2 className="h3 text-brand-dark">{label}</h2>
              <div className="mt-3 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
                {items.map((item) => (
                  <details key={item.q} className="group" open={q.length > 2}>
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
                      {item.q}<ChevronDown className="h-6 w-6 shrink-0 text-brand transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <p className="px-5 pb-5 text-base text-ink-soft">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
