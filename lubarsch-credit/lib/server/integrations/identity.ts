/**
 * BVN / NIN verification — INTERFACE ONLY.
 * Implement one provider (Dojah, Prembly/IdentityPass or Smile ID) once you have keys.
 * Nothing here calls a real API.
 */
export type VerificationResult =
  | { status: "not_configured" }
  | { status: "match"; provider: string }
  | { status: "mismatch"; provider: string; reason: string }
  | { status: "error"; provider: string; message: string };

export interface IdentityVerifier {
  verifyBvn(bvn: string, person: { fullName: string; dob: string }): Promise<VerificationResult>;
  verifyNin(nin: string, person: { fullName: string; dob: string }): Promise<VerificationResult>;
}

const notConfigured: IdentityVerifier = {
  async verifyBvn() { return { status: "not_configured" }; },
  async verifyNin() { return { status: "not_configured" }; },
};

export function getIdentityVerifier(): IdentityVerifier {
  // e.g. if (process.env.IDENTITY_PROVIDER === "dojah") return dojahVerifier;
  return notConfigured;
}
