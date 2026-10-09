/**
 * LOAN PRODUCTS — the single source of truth for rates, fees and limits.
 *
 * Change numbers here and every page, the calculator and the apply form update.
 * Rates are decimals: 0.12 = 12%.
 *
 * `null` means "not yet confirmed". The site will show "rate being confirmed"
 * and the calculator will ask people to call for a quote instead of guessing.
 */

export type ProductId = "daily" | "weekly";
export type InterestTiming = "upfront" | "in-repayments";

export interface Tenor {
  id: string; // e.g. "20-day"
  /** number of repayments */
  periods: number;
  interestRate: number | null;
}

export interface Product {
  id: ProductId;
  interestTiming: InterestTiming;
  period: "day" | "week";
  tenors: Tenor[];
  minAmount: number;
  maxAmount: number;
  /** Slider step in ₦ */
  step: number;
  /** false = min/max still need confirming; the site labels them "indicative" */
  limitsConfirmed: boolean;
}

export const lending = {
  /** Flat admin fee in ₦, taken upfront on every product */
  adminFee: 2000,
  /** Instalments are rounded UP to the nearest multiple of this (₦) */
  roundInstalmentTo: 50,
} as const;

export const products: Record<ProductId, Product> = {
  daily: {
    id: "daily",
    interestTiming: "upfront",
    period: "day",
    tenors: [
      { id: "20-day", periods: 20, interestRate: 0.12 },
      { id: "40-day", periods: 40, interestRate: 0.17 },
    ],
    minAmount: 20_000, // TODO: confirm
    maxAmount: 500_000, // TODO: confirm
    step: 5_000,
    limitsConfirmed: false,
  },
  weekly: {
    id: "weekly",
    interestTiming: "in-repayments",
    period: "week",
    tenors: [
      { id: "12-week", periods: 12, interestRate: null }, // TODO: confirm weekly rate
      { id: "16-week", periods: 16, interestRate: null }, // TODO: confirm weekly rate
    ],
    minAmount: 50_000, // TODO: confirm
    maxAmount: 1_000_000, // TODO: confirm
    step: 10_000,
    limitsConfirmed: false,
  },
};

export const productList = [products.daily, products.weekly];

export function getTenor(productId: ProductId, tenorId: string): Tenor | undefined {
  return products[productId]?.tenors.find((t) => t.id === tenorId);
}

export function isProductId(v: unknown): v is ProductId {
  return v === "daily" || v === "weekly";
}

/** Investor notes (private placements — NOT deposits or savings). */
export const investorNotes = {
  baselineAnnualReturn: 0.1, // 10% p.a. — baseline, not guaranteed
  tenorsMonths: [3, 6, 12, 24, 36],
  minimumTenorMonths: 3,
} as const;
