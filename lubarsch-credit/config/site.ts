/**
 * Business details used across the whole site.
 * Everything marked TODO is a placeholder — see CONTENT-TODO.md.
 */
export const site = {
  name: "Lubarsch Credit",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lubarschcredit.com", // TODO: confirm domain

  /** Which tagline to show. Options live in each locale file under `brand.taglines`. */
  taglineKey: "money" as "money" | "partner" | "yoruba",

  // TODO: real contact details
  phone: "+234 800 000 0000",
  phoneHref: "tel:+2348000000000",
  whatsappNumber: "2348000000000", // international format, digits only
  email: "hello@lubarschcredit.com",
  dataProtectionEmail: "privacy@lubarschcredit.com",

  address: {
    street: "[Office address — street and number]", // TODO
    area: "[Area, e.g. Bodija]", // TODO
    city: "Ibadan",
    state: "Oyo State",
    country: "NG",
    postalCode: "", // TODO (optional)
    lat: 7.4152, // TODO: exact office coordinates
    lng: 3.9105,
  },

  openingHours: [
    { days: "Mon–Fri", opens: "08:00", closes: "17:00", schema: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
    { days: "Sat", opens: "09:00", closes: "14:00", schema: ["Saturday"] },
  ],

  // TODO: complete exactly as it appears on your licence. Do not claim CBN regulation unless true.
  licenceLine: "Licensed as [LICENCE TYPE] by [REGULATOR] — Reg. No. [XXXX]",

  social: {
    facebook: "", // TODO
    instagram: "",
    tiktok: "",
    x: "",
  },

  /** Shown on the site until online repayments (Paystack/Flutterwave) go live. */
  repaymentBank: {
    bankName: "[Bank name]", // TODO
    accountName: "Lubarsch Credit [Ltd]", // TODO
    accountNumber: "[0000000000]", // TODO
  },
} as const;

export type Site = typeof site;

export const whatsappLink = (message: string) =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
