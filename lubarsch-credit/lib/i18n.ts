import en from "@/locales/en.json";
import yo from "@/locales/yo.json";
import pcm from "@/locales/pcm.json";
import { defaultLocale, isLocale, type Locale } from "./i18n-config";

export type Dict = typeof en;

type Json = Record<string, unknown>;

function isObject(v: unknown): v is Json {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Locale values win; anything missing falls back to English. Arrays are replaced whole. */
function deepMerge<T>(base: T, override: unknown): T {
  if (!isObject(base) || !isObject(override)) return (override ?? base) as T;
  const out: Json = { ...(base as Json) };
  for (const [k, v] of Object.entries(override)) {
    if (k.startsWith("_")) continue;
    out[k] = isObject(v) && isObject(out[k]) ? deepMerge(out[k], v) : v;
  }
  return out as T;
}

const dictionaries: Record<Locale, Dict> = {
  en,
  yo: deepMerge(en, yo),
  pcm: deepMerge(en, pcm),
};

export function getDictionary(locale: string): Dict {
  return dictionaries[isLocale(locale) ? locale : defaultLocale];
}

/** fill("Pay {amount} daily", { amount: "₦2,500" }) */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}

/** Sections every page sends to the browser (header, menu, calculator, consent banner). */
export const sharedClientKeys = ["nav", "common", "consent", "whatsapp", "calculator", "products", "errors"] as const;

export function pickDict<K extends keyof Dict>(dict: Dict, keys: readonly K[]): Pick<Dict, K> {
  const out = {} as Pick<Dict, K>;
  for (const k of keys) out[k] = dict[k];
  return out;
}
