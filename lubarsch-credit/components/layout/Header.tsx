import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import { site } from "@/config/site";
import type { Dict } from "@/lib/i18n";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { primaryNav } from "./navItems";

export function Header({ t }: { t: Dict }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/85">
      <a href="#main" className="sr-only-focusable absolute top-2 left-2 z-50 rounded bg-white px-4 py-2 font-bold">
        {t.nav.skip}
      </a>
      <div className="container-page flex h-16 items-center gap-1.5 sm:h-20 sm:gap-2">
        <Link href="/" className="mr-auto flex min-h-12 items-center">
          <Logo />
          <span className="sr-only"> — {t.nav.home}</span>
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {primaryNav(t).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex min-h-12 items-center rounded-full px-2.5 font-bold whitespace-nowrap text-ink hover:bg-brand-light hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden sm:block"><LanguageSwitcher /></div>
        <div className="sm:hidden"><LanguageSwitcher variant="select" /></div>

        <a href={site.phoneHref} className="hidden min-h-12 min-w-12 items-center justify-center rounded-full text-brand hover:bg-brand-light sm:flex" title={site.phone}>
          <Phone className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">{t.common.callUs} {site.phone}</span>
        </a>

        <Link href="/apply" className="btn-primary hidden px-5 whitespace-nowrap sm:inline-flex">
          <FileText className="h-5 w-5" aria-hidden="true" />
          {t.common.getLoan}
        </Link>

        <MobileMenu />
      </div>
    </header>
  );
}
