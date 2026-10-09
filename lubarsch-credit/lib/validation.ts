/**
 * Validation shared by the browser (instant, friendly messages) and the server (the real check).
 * Functions return an error KEY from `errors` in the locale files, or null when valid.
 */
import { products, isProductId } from "@/config/products";

export type ErrorKey =
  | "required" | "name" | "phone" | "dob" | "bvn" | "idNumber" | "amount" | "consent" | "email" | "choose" | "reference";
export type Errors = Partial<Record<string, ErrorKey>>;

export const BUSINESS_TYPES = ["foodstuff", "fabrics", "provisions", "food-vendor", "hair-beauty", "tailoring", "phone-accessories", "other"] as const;
export const YEARS = ["lt1", "1-3", "3-5", "5plus"] as const;
export const SALES = ["lt10k", "10-30k", "30-70k", "70-150k", "150kplus"] as const;
export const PURPOSES = ["stock", "equipment", "rent", "other"] as const;
export const ID_TYPES = ["nin", "voters", "drivers", "passport"] as const;
export const RELATIONSHIPS = ["spouse", "family", "trader", "association", "other"] as const;
export const GENDERS = ["female", "male", "preferNot"] as const;
export const LANGS = ["en", "yo", "pcm"] as const;
export const CALL_TIMES = ["morning", "afternoon", "evening"] as const;

/** Returns +234XXXXXXXXXX or null. Accepts 0803…, 803…, 234803…, +234 803 … */
export function normalizeNigerianPhone(input: string | undefined | null): string | null {
  if (!input) return null;
  let d = String(input).replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("234")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  if (!/^[789][01]\d{8}$/.test(d)) return null;
  return `+234${d}`;
}

export function isFullName(v: string | undefined): boolean {
  const parts = (v ?? "").trim().split(/\s+/).filter((p) => p.replace(/[^\p{L}]/gu, "").length >= 2);
  return parts.length >= 2 && (v ?? "").length <= 100;
}

export function ageOn(dobIso: string, today = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dobIso ?? "");
  if (!m) return null;
  const dob = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (Number.isNaN(dob.getTime())) return null;
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const md = today.getUTCMonth() - dob.getUTCMonth();
  if (md < 0 || (md === 0 && today.getUTCDate() < dob.getUTCDate())) age--;
  return age;
}

export const isBvn = (v: string | undefined) => /^\d{11}$/.test((v ?? "").replace(/\s/g, ""));
export const isEmail = (v: string | undefined) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v ?? "");
export const isReference = (v: string | undefined) => /^LBC-\d{4}-\d{6}$/i.test((v ?? "").trim());
const oneOf = (list: readonly string[], v: unknown) => typeof v === "string" && list.includes(v);
const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;

export interface ApplicationInput {
  // Step 1
  fullName: string;
  phone: string;
  whatsappSame: boolean;
  whatsapp: string;
  gender: string;
  dob: string;
  address: string;
  lga: string;
  language: string;
  // Step 2
  businessType: string;
  market: string;
  marketOther: string;
  stall: string;
  years: string;
  dailySales: string;
  // Step 3
  product: string;
  tenor: string;
  amount: number;
  purpose: string;
  // Step 4
  idType: string;
  idNumber: string;
  bvn: string;
  photo: string; // compressed data URL (optional)
  guarantorName: string;
  guarantorPhone: string;
  guarantorRelationship: string;
  agentCode: string;
  // Step 5
  consentTerms: boolean;
  consentPrivacy: boolean;
  consentContact: boolean;
}

export const emptyApplication: ApplicationInput = {
  fullName: "", phone: "", whatsappSame: true, whatsapp: "", gender: "", dob: "", address: "", lga: "", language: "",
  businessType: "", market: "", marketOther: "", stall: "", years: "", dailySales: "",
  product: "daily", tenor: "20-day", amount: 50_000, purpose: "",
  idType: "", idNumber: "", bvn: "", photo: "", guarantorName: "", guarantorPhone: "", guarantorRelationship: "", agentCode: "",
  consentTerms: false, consentPrivacy: false, consentContact: false,
};

export const APPLY_STEPS = 5;

export function validateApplicationStep(step: number, a: ApplicationInput, today = new Date()): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (!isFullName(a.fullName)) e.fullName = "name";
    if (!normalizeNigerianPhone(a.phone)) e.phone = "phone";
    if (!a.whatsappSame && !normalizeNigerianPhone(a.whatsapp)) e.whatsapp = "phone";
    if (!oneOf(GENDERS, a.gender)) e.gender = "choose";
    const age = ageOn(a.dob, today);
    if (age === null || age < 18 || age > 100) e.dob = "dob";
    if (!filled(a.address) || a.address.length > 300) e.address = "required";
    if (!filled(a.lga)) e.lga = "choose";
    if (!oneOf(LANGS, a.language)) e.language = "choose";
  }
  if (step === 2) {
    if (!oneOf(BUSINESS_TYPES, a.businessType)) e.businessType = "choose";
    if (!filled(a.market)) e.market = "choose";
    if (a.market === "other" && !filled(a.marketOther)) e.marketOther = "required";
    if (!filled(a.stall) || a.stall.length > 200) e.stall = "required";
    if (!oneOf(YEARS, a.years)) e.years = "choose";
    if (!oneOf(SALES, a.dailySales)) e.dailySales = "choose";
  }
  if (step === 3) {
    if (!isProductId(a.product)) e.product = "choose";
    else {
      const p = products[a.product];
      if (!p.tenors.some((t) => t.id === a.tenor)) e.tenor = "choose";
      if (!Number.isFinite(a.amount) || a.amount < p.minAmount || a.amount > p.maxAmount) e.amount = "amount";
    }
    if (!oneOf(PURPOSES, a.purpose)) e.purpose = "choose";
  }
  if (step === 4) {
    if (!oneOf(ID_TYPES, a.idType)) e.idType = "choose";
    if (!/^[A-Za-z0-9\- ]{5,30}$/.test(a.idNumber ?? "")) e.idNumber = "idNumber";
    if (!isBvn(a.bvn)) e.bvn = "bvn";
    if (!isFullName(a.guarantorName)) e.guarantorName = "name";
    if (!normalizeNigerianPhone(a.guarantorPhone)) e.guarantorPhone = "phone";
    if (!oneOf(RELATIONSHIPS, a.guarantorRelationship)) e.guarantorRelationship = "choose";
  }
  if (step === 5) {
    if (a.consentTerms !== true) e.consentTerms = "consent";
    if (a.consentPrivacy !== true) e.consentPrivacy = "consent";
  }
  return e;
}

export function validateApplication(a: ApplicationInput, today = new Date()): Errors {
  let all: Errors = {};
  for (let s = 1; s <= APPLY_STEPS; s++) all = { ...all, ...validateApplicationStep(s, a, today) };
  return all;
}

/** First step containing an error (used to send the user back to fix it). */
export function firstStepWithError(a: ApplicationInput): number | null {
  for (let s = 1; s <= APPLY_STEPS; s++) if (Object.keys(validateApplicationStep(s, a)).length) return s;
  return null;
}

/** Which step each field lives on (to send people back to the right screen). */
export const STEP_FIELDS: Record<number, (keyof ApplicationInput)[]> = {
  1: ["fullName", "phone", "whatsappSame", "whatsapp", "gender", "dob", "address", "lga", "language"],
  2: ["businessType", "market", "marketOther", "stall", "years", "dailySales"],
  3: ["product", "tenor", "amount", "purpose"],
  4: ["idType", "idNumber", "bvn", "photo", "guarantorName", "guarantorPhone", "guarantorRelationship", "agentCode"],
  5: ["consentTerms", "consentPrivacy", "consentContact"],
};

export function stepOfField(field: string): number {
  for (const [step, fields] of Object.entries(STEP_FIELDS)) if ((fields as string[]).includes(field)) return Number(step);
  return APPLY_STEPS;
}
