"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

const KEY = "lc_consent"; // "granted" | "denied"
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SRC = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";

function loadAnalytics() {
  if (!PLAUSIBLE_DOMAIN || document.getElementById("plausible")) return;
  const s = document.createElement("script");
  s.id = "plausible";
  s.defer = true;
  s.dataset.domain = PLAUSIBLE_DOMAIN;
  s.src = PLAUSIBLE_SRC;
  document.head.appendChild(s);
}

/** Analytics only load after an explicit "Accept". Nothing is pre-ticked. */
export function ConsentBanner() {
  const { dict: t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!PLAUSIBLE_DOMAIN) return; // no analytics configured → nothing to ask
    let stored: string | null = null;
    try { stored = localStorage.getItem(KEY); } catch {}
    if (stored === "granted") loadAnalytics();
    else if (!stored) setShow(true);
  }, []);

  function decide(v: "granted" | "denied") {
    try { localStorage.setItem(KEY, v); } catch {}
    if (v === "granted") loadAnalytics();
    setShow(false);
  }

  if (!show) return null;
  return (
    <div role="region" aria-label="Cookie consent" className="fixed inset-x-0 bottom-16 z-50 p-3 lg:bottom-0">
      <div className="card mx-auto max-w-2xl border-2 border-brand">
        <p className="text-base">
          {t.consent.text} <Link href="/legal/privacy" className="font-bold text-brand underline">{t.consent.more}</Link>
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => decide("granted")}>{t.consent.accept}</button>
          <button type="button" className="btn-outline" onClick={() => decide("denied")}>{t.consent.decline}</button>
        </div>
      </div>
    </div>
  );
}
