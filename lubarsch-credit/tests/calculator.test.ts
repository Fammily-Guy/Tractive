import { describe, expect, it } from "vitest";
import { calculateQuote, roundUpTo, type CalculatorConfig } from "@/lib/calculator";
import { lending, products } from "@/config/products";

// Weekly rates are not confirmed yet, so tests use an explicit test config.
const config: CalculatorConfig = {
  lending: { adminFee: 2000, roundInstalmentTo: 50 },
  products: {
    daily: { ...products.daily, minAmount: 10_000, maxAmount: 500_000 },
    weekly: {
      ...products.weekly,
      minAmount: 50_000,
      maxAmount: 1_000_000,
      tenors: [
        { id: "12-week", periods: 12, interestRate: 0.2 },
        { id: "16-week", periods: 16, interestRate: 0.25 },
      ],
    },
  },
};

describe("roundUpTo", () => {
  it("rounds up to the nearest 50", () => {
    expect(roundUpTo(2500, 50)).toBe(2500);
    expect(roundUpTo(2501, 50)).toBe(2550);
    expect(roundUpTo(1250.0000001, 50)).toBe(1250);
    expect(roundUpTo(1, 50)).toBe(50);
  });
});

describe("daily 20-day (12% upfront)", () => {
  it("matches the brief example: borrow ₦50,000, receive ₦42,000, pay ₦2,500 x 20", () => {
    const r = calculateQuote("daily", "20-day", 50_000, config);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.quote.interest).toBe(6_000);
    expect(r.quote.adminFee).toBe(2_000);
    expect(r.quote.cashReceived).toBe(42_000);
    expect(r.quote.instalment).toBe(2_500);
    expect(r.quote.numberOfPayments).toBe(20);
    expect(r.quote.totalRepaid).toBe(50_000);
    expect(r.quote.totalCost).toBe(8_000);
    expect(r.quote.interestTiming).toBe("upfront");
  });

  it("rounds instalments up to ₦50 and totals accordingly", () => {
    const r = calculateQuote("daily", "20-day", 33_333, config);
    if (!r.ok) throw new Error(r.error);
    expect(r.quote.instalmentExact).toBeCloseTo(1666.65, 2);
    expect(r.quote.instalment).toBe(1_700);
    expect(r.quote.totalRepaid).toBe(34_000);
    expect(r.quote.totalCost).toBe(r.quote.totalRepaid - r.quote.cashReceived);
  });
});

describe("daily 40-day (17% upfront)", () => {
  it("calculates ₦100,000 over 40 days", () => {
    const r = calculateQuote("daily", "40-day", 100_000, config);
    if (!r.ok) throw new Error(r.error);
    expect(r.quote.interest).toBe(17_000);
    expect(r.quote.cashReceived).toBe(81_000);
    expect(r.quote.instalment).toBe(2_500);
    expect(r.quote.numberOfPayments).toBe(40);
    expect(r.quote.totalRepaid).toBe(100_000);
    expect(r.quote.totalCost).toBe(19_000);
  });
});

describe("weekly 12-week (interest in repayments)", () => {
  it("takes only the admin fee upfront", () => {
    const r = calculateQuote("weekly", "12-week", 120_000, config);
    if (!r.ok) throw new Error(r.error);
    expect(r.quote.interest).toBe(24_000);
    expect(r.quote.cashReceived).toBe(118_000);
    expect(r.quote.instalment).toBe(12_000);
    expect(r.quote.numberOfPayments).toBe(12);
    expect(r.quote.totalRepaid).toBe(144_000);
    expect(r.quote.totalCost).toBe(26_000);
    expect(r.quote.interestTiming).toBe("in-repayments");
  });
});

describe("weekly 16-week (interest in repayments)", () => {
  it("rounds weekly instalment up to ₦50", () => {
    const r = calculateQuote("weekly", "16-week", 100_000, config);
    if (!r.ok) throw new Error(r.error);
    expect(r.quote.interest).toBe(25_000);
    expect(r.quote.instalmentExact).toBe(7_812.5);
    expect(r.quote.instalment).toBe(7_850);
    expect(r.quote.totalRepaid).toBe(125_600);
    expect(r.quote.cashReceived).toBe(98_000);
    expect(r.quote.totalCost).toBe(27_600);
  });
});

describe("validation", () => {
  it("rejects amounts below the minimum", () => {
    expect(calculateQuote("daily", "20-day", 5_000, config)).toMatchObject({ ok: false, error: "below-min" });
  });
  it("rejects amounts above the maximum", () => {
    expect(calculateQuote("weekly", "12-week", 2_000_000, config)).toMatchObject({ ok: false, error: "above-max" });
  });
  it("rejects when cash received would be zero or less", () => {
    const tiny: CalculatorConfig = { ...config, products: { ...config.products, daily: { ...config.products.daily, minAmount: 0 } } };
    expect(calculateQuote("daily", "20-day", 2_000, tiny)).toMatchObject({ ok: false, error: "not-enough-cash" });
  });
  it("rejects unknown tenors", () => {
    expect(calculateQuote("daily", "30-day", 50_000, config)).toMatchObject({ ok: false, error: "unknown-tenor" });
  });
  it("reports rate-not-set while the weekly rate is unconfirmed in the live config", () => {
    const live = products.weekly.tenors[0].interestRate;
    const r = calculateQuote("weekly", "12-week", 100_000, { lending, products });
    if (live === null) expect(r).toMatchObject({ ok: false, error: "rate-not-set" });
    else expect(r.ok).toBe(true);
  });
  it("uses live config for daily products", () => {
    const r = calculateQuote("daily", "20-day", 50_000);
    expect(r.ok).toBe(true);
  });
});
