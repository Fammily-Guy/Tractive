/**
 * Repayments (phase 2) — INTERFACE ONLY. Implement with Paystack or Flutterwave
 * (transfer / USSD / card). Until then the site shows bank details from config/site.ts.
 */
export interface PaymentLink { url: string; reference: string }

export interface PaymentProvider {
  createRepaymentLink(input: { applicationRef: string; amount: number; phone: string; email?: string }): Promise<PaymentLink>;
  verifyWebhook(rawBody: string, signature: string | null): boolean;
}

export function getPaymentProvider(): PaymentProvider | null {
  // e.g. if (process.env.PAYMENTS_PROVIDER === "paystack") return paystackProvider;
  return null;
}
