"use client";

import { createContext, useContext } from "react";
import type { Dict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";

/**
 * Only the dictionary sections a page needs are sent to the browser (keeps pages light on 3G).
 * The root layout provides the shared sections; pages with forms add theirs with <I18nScope>.
 */
type Ctx = { dict: Dict; locale: Locale };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ dict, locale, children }: { dict: Partial<Dict>; locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ dict: dict as Dict, locale }}>{children}</I18nContext.Provider>;
}

export function I18nScope({ dict, children }: { dict: Partial<Dict>; children: React.ReactNode }) {
  const parent = useContext(I18nContext);
  if (!parent) throw new Error("I18nScope must be inside I18nProvider");
  return <I18nContext.Provider value={{ locale: parent.locale, dict: { ...parent.dict, ...dict } as Dict }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
