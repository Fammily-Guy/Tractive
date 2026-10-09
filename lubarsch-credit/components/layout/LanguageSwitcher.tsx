"use client";

import { Globe } from "lucide-react";
import { locales, localeLabels, LOCALE_COOKIE, type Locale } from "@/lib/i18n-config";
import { useI18n } from "@/components/I18nProvider";

export function LanguageSwitcher({ variant = "compact" }: { variant?: "compact" | "full" | "select" }) {
  const { locale, dict } = useI18n();

  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Strip any /yo or /pcm prefix so the cookie decides; full reload keeps logic simple on slow phones.
    const path = window.location.pathname.replace(/^\/(en|yo|pcm)(?=\/|$)/, "") || "/";
    window.location.assign(path + window.location.search);
  }

  if (variant === "select") {
    return (
      <label className="relative flex min-h-12 items-center gap-1 rounded-full border-2 border-brand/30 px-2.5 text-sm font-extrabold text-brand">
        <Globe className="h-5 w-5" aria-hidden="true" />
        <span aria-hidden="true">{localeLabels[locale].short}</span>
        <span className="sr-only">{dict.nav.language}</span>
        {/* Transparent native select over the label: opens the phone's own picker with full language names */}
        <select
          value={locale}
          onChange={(e) => choose(e.target.value as Locale)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {locales.map((l) => (
            <option key={l} value={l} lang={localeLabels[l].htmlLang}>{localeLabels[l].name}</option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div role="group" aria-label={dict.nav.language} className="flex items-center gap-1">
      {variant === "full" && <Globe className="mr-1 h-5 w-5 text-brand" aria-hidden="true" />}
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={localeLabels[l].htmlLang}
          onClick={() => choose(l)}
          aria-pressed={l === locale}
          title={localeLabels[l].name}
          className={`min-h-12 rounded-full px-2.5 text-sm font-extrabold sm:px-3 ${
            l === locale ? "bg-brand text-white" : "text-brand hover:bg-brand-light"
          }`}
        >
          {variant === "full" ? localeLabels[l].name : localeLabels[l].short}
          {variant === "compact" && <span className="sr-only"> — {localeLabels[l].name}</span>}
        </button>
      ))}
    </div>
  );
}
