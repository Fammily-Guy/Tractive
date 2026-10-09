export const locales = ["en", "yo", "pcm"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "lc_locale";

export const localeLabels: Record<Locale, { short: string; name: string; htmlLang: string }> = {
  en: { short: "EN", name: "English", htmlLang: "en-NG" },
  yo: { short: "YO", name: "Yorùbá", htmlLang: "yo" },
  pcm: { short: "PCM", name: "Pidgin", htmlLang: "pcm" },
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (locales as readonly string[]).includes(v);
}
