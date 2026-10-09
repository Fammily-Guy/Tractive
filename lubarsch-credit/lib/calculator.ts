import {
  lending as defaultLending,
  products as defaultProducts,
  type Product,
  type ProductId,
} from "@/config/products";

export interface CalculatorConfig {
  lending: { adminFee: number; roundInstalmentTo: number };
  products: Record<ProductId, Product>;
}

export type QuoteError =
  | "unknown-product"
  | "unknown-tenor"
  | "rate-not-set"
  | "below-min"
  | "above-max"
  | "not-enough-cash";

export interface Quote {
  productId: ProductId;
  tenorId: string;
  principal: number;
  adminFee: number;
  interestRate: number;
  interest: number;
  interestTiming: "upfront" | "in-repayments";
  cashReceived: number;
  /** rounded up to config.lending.roundInstalmentTo */
  instalment: number;
  /** exact instalment before rounding */
  instalmentExact: number;
  numberOfPayments: number;
  period: "day" | "week";
  /** instalment × numberOfPayments (uses the rounded instalment) */
  totalRepaid: number;
  /** totalRepaid − cashReceived: the real cost of the loan */
  totalCost: number;
}

export type QuoteResult = { ok: true; quote: Quote } | { ok: false; error: QuoteError; min?: number; max?: number };

export const defaultConfig: CalculatorConfig = { lending: defaultLending, products: defaultProducts };

export function roundUpTo(value: number, step: number): number {
  if (step <= 0) return Math.ceil(value);
  // guard against floating point noise, e.g. 2500.0000000001
  const n = Math.round((value / step) * 1e6) / 1e6;
  return Math.ceil(n) * step;
}

/**
 * Implements the brief exactly:
 *  DAILY  — interest taken upfront; repayments cover principal only.
 *  WEEKLY — interest added to repayments; only the admin fee is taken upfront.
 */
export function calculateQuote(
  productId: ProductId,
  tenorId: string,
  principal: number,
  config: CalculatorConfig = defaultConfig,
): QuoteResult {
  const product = config.products[productId];
  if (!product) return { ok: false, error: "unknown-product" };
  const tenor = product.tenors.find((t) => t.id === tenorId);
  if (!tenor) return { ok: false, error: "unknown-tenor" };
  if (tenor.interestRate === null || tenor.interestRate === undefined) return { ok: false, error: "rate-not-set" };
  if (!Number.isFinite(principal) || principal < product.minAmount)
    return { ok: false, error: "below-min", min: product.minAmount, max: product.maxAmount };
  if (principal > product.maxAmount) return { ok: false, error: "above-max", min: product.minAmount, max: product.maxAmount };

  const { adminFee, roundInstalmentTo } = config.lending;
  const rate = tenor.interestRate;
  const interest = Math.round(principal * rate);
  const n = tenor.periods;

  let cashReceived: number;
  let instalmentExact: number;

  if (product.interestTiming === "upfront") {
    cashReceived = principal - interest - adminFee;
    instalmentExact = principal / n;
  } else {
    cashReceived = principal - adminFee;
    instalmentExact = (principal + interest) / n;
  }

  if (cashReceived <= 0) return { ok: false, error: "not-enough-cash", min: product.minAmount, max: product.maxAmount };

  const instalment = roundUpTo(instalmentExact, roundInstalmentTo);
  const totalRepaid = instalment * n;

  return {
    ok: true,
    quote: {
      productId,
      tenorId,
      principal,
      adminFee,
      interestRate: rate,
      interest,
      interestTiming: product.interestTiming,
      cashReceived,
      instalment,
      instalmentExact,
      numberOfPayments: n,
      period: product.period,
      totalRepaid,
      // everything you pay back minus the cash you actually receive (= interest + admin fee, plus any rounding)
      totalCost: totalRepaid - cashReceived,
    },
  };
}
