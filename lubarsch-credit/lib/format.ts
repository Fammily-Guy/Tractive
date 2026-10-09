const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

/** ₦50,000 — always with the naira sign and thousands separators */
export function formatNaira(value: number): string {
  return `₦${naira.format(Math.round(value))}`;
}

export function formatNumber(value: number): string {
  return naira.format(value);
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 1000) / 10}%`;
}

export function formatDate(iso: string, locale = "en-NG"): string {
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}
