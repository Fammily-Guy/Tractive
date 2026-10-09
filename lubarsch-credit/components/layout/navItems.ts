import type { Dict } from "@/lib/i18n";

export const primaryNav = (t: Dict) => [
  { href: "/loans", label: t.nav.loans },
  { href: "/calculator", label: t.nav.calculator },
  { href: "/how-it-works", label: t.nav.howItWorks },
  { href: "/about", label: t.nav.about },
  { href: "/branches", label: t.nav.branches },
  { href: "/faqs", label: t.nav.faqs },
  { href: "/contact", label: t.nav.contact },
];

export const secondaryNav = (t: Dict) => [
  { href: "/check-status", label: t.nav.status },
  { href: "/stories", label: t.nav.stories },
  { href: "/blog", label: t.nav.blog },
  { href: "/become-an-agent", label: t.nav.agent },
  { href: "/investors", label: t.nav.investors },
];
