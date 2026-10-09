"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Menu, Phone, X } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { site } from "@/config/site";
import { primaryNav, secondaryNav } from "./navItems";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileMenu() {
  const { dict: t } = useI18n();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex min-h-12 min-w-12 items-center justify-center rounded-full text-brand hover:bg-brand-light"
      >
        <Menu className="h-7 w-7" aria-hidden="true" />
        <span className="sr-only">{t.nav.menu}</span>
      </button>

      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label={t.nav.menu} className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <LanguageSwitcher variant="full" />
            <button type="button" onClick={() => setOpen(false)} className="flex min-h-12 min-w-12 items-center justify-center rounded-full text-brand hover:bg-brand-light">
              <X className="h-7 w-7" aria-hidden="true" />
              <span className="sr-only">{t.nav.closeMenu}</span>
            </button>
          </div>
          <nav className="flex-1 px-4 py-4" aria-label={t.nav.menu}>
            <ul className="space-y-1">
              {[{ href: "/", label: t.nav.home }, ...primaryNav(t)].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex min-h-12 items-center rounded-xl px-3 text-xl font-bold hover:bg-brand-light" aria-current={pathname === item.href ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-1 border-t border-line pt-4">
              {secondaryNav(t).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex min-h-12 items-center rounded-xl px-3 text-lg font-semibold text-ink-soft hover:bg-brand-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid grid-cols-2 gap-3 border-t border-line p-4">
            <a href={site.phoneHref} className="btn-outline"><Phone className="h-5 w-5" aria-hidden="true" />{t.common.call}</a>
            <Link href="/apply" className="btn-primary"><FileText className="h-5 w-5" aria-hidden="true" />{t.common.getLoan}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
