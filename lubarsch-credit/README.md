# Lubarsch Credit — website

Marketing site and loan application for **Lubarsch Credit**, a lender for market women and small traders in Ibadan.
It is built with Next.js (App Router), TypeScript and Tailwind CSS. It is mobile-first (360px), works on slow
networks and installs as an app (PWA). It is available in **English, Yorùbá and Nigerian Pidgin**.

👉 **Before launch, work through [`CONTENT-TODO.md`](./CONTENT-TODO.md).**

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build |
| `npm test` | Calculator unit tests (Vitest) |
| `npm run test:e2e` | Apply flow on a 360px phone (Playwright) |
| `npm run typecheck` | TypeScript check |
| `npm run images` | Regenerate placeholder images and icons |
| `npm run hash-password -- "pw"` | Create a staff password hash and 2FA secret |

In development, the staff dashboard is at **/admin**. Sign in with `admin@example.com` / `change-me`; this
dev account only exists when `ADMIN_USERS` is not set and the server is not in production. Without Supabase,
data is saved to `.data/db.json`, which git ignores.

## Change rates, fees and loan limits
Everything comes from **`config/products.ts`**: interest rates, the ₦2,000 admin fee, the ₦50 instalment
rounding, tenors and min/max amounts. The calculator, product pages, comparison table, apply form and admin
export all update automatically. A rate set to `null` shows "rate being confirmed" instead of a guess.
After changing numbers, run `npm test`.

Business details (phone, WhatsApp, address, hours, licence line, bank account) are in **`config/site.ts`**.

## Change words and translations
- All copy is in **`locales/en.json`**, **`locales/yo.json`** and **`locales/pcm.json`**.
- Any key missing from `yo.json` or `pcm.json` shows the English text, so you can translate a little at a time.
- Yorùbá and Pidgin are first drafts and **must be checked by a native speaker**.
- FAQs are in the locale files under `faqs.items`. Each item has a `group`: `applying`, `fees`, `repayment`,
  `safety` or `investors`.
- Visitors switch language from the header. The choice is saved in a cookie and URLs stay clean (`/loans`).
  Links like `/yo/loans` also work.

## Edit other content (no code needed)
| What | File |
|---|---|
| Markets and officer visit days | `content/markets.json` |
| Customer stories (shown only with `"consent": true`) | `content/stories.json` |
| Team | `content/team.json` |
| Impact numbers (`null` = "Coming soon") | `content/impact.json` |
| LGAs in the form | `content/lgas.json` |
| Legal pages | `content/legal/*.md` |
| Admin CSV export columns (match your Excel register) | `config/export-mapping.ts` |
| Brand colours | the `@theme` block at the top of `app/globals.css` |

## Add a blog post
Create `content/blog/my-post-title.md`:

```md
---
title: "My post title"
date: 2026-11-01
category: business-tips   # business-tips | money-management | customer-stories | company-news
excerpt: "One sentence summary."
draft: false
---

Write the post in **Markdown** here.
```

Drafts are shown with a "Draft" badge and are kept out of the sitemap and search engines.

## Replace images
Put your photos in `public/images/` with the **same file names** (for example `placeholder-hero.jpg`), or
change the paths in `content/*.json`. Next.js converts them to WebP/AVIF and resizes them for each phone.
Update the `alt` text to describe the real photo.

## Share a clickable demo (Netlify Drop)
```bash
npm run build:demo     # → lubarsch-credit-demo.zip and demo-site/
```
Go to **app.netlify.com/drop** and drag in the `demo-site` folder, or the unzipped zip. You get a public link
to share. The demo has every public page in all three languages, and the calculator and apply flow work. Forms
are **simulated** in the browser and nothing is sent; a banner says so. The staff dashboard is not included.

## Deploy (Vercel)
1. Import the repository in Vercel and set **Root Directory** to `lubarsch-credit`.
2. Add the environment variables from `.env.example`. These are **required**: `DATA_ENCRYPTION_KEY`,
   `SESSION_SECRET` and `ADMIN_USERS` (with `totpSecret`).
3. For data storage, create a Supabase project, run `supabase/schema.sql`, then set `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY`. Vercel cannot keep the local `.data` file.
4. Point your domain at Vercel and set `NEXT_PUBLIC_SITE_URL`.

Without `DATA_ENCRYPTION_KEY`, the production server refuses to store applications, because it will not
keep BVNs unencrypted. The form then offers "Send via WhatsApp" instead.

## How it is built
```
app/[locale]/…        public pages, pre-rendered for en / yo / pcm
app/admin/…           staff dashboard (sign-in, applications, inboxes, CSV export)
app/api/…             form endpoints (validation, rate limit, honeypot, Turnstile)
middleware.ts         language cookie → clean URLs
config/               products & rates, business details, export columns
content/              markets, stories, team, impact, blog, legal (editable)
locales/              translations
lib/calculator.ts     loan maths (unit-tested in tests/calculator.test.ts)
lib/validation.ts     shared browser + server validation
lib/server/           repository (file / Supabase), encryption, auth, notifications, integrations
supabase/schema.sql   Postgres tables + Row Level Security
public/sw.js          service worker (offline page with call / WhatsApp)
```

### Integrations (stubs with clean interfaces)
- **SMS/WhatsApp** — `lib/server/integrations/messaging.ts` (Termii, Twilio, or console log)
- **Email** — `lib/server/integrations/email.ts` (Resend or console)
- **BVN/NIN checks** — `lib/server/integrations/identity.ts` (interface only; add Dojah, Prembly or Smile ID)
- **Repayments** — `lib/server/integrations/payments.ts` (interface only; add Paystack or Flutterwave)
- **Data store** — `lib/server/repository.ts` picks Supabase or the local file. Add another `Repository` there.

### Privacy and safety built in
- BVN and ID numbers are encrypted (AES-256-GCM) before storage and masked in the dashboard. Only an
  admin can reveal them, and each reveal is logged.
- Form progress is saved on the phone, but **BVN, ID number and photos are never saved there**, because
  phones are often shared.
- Consent boxes are never pre-ticked. The full loan cost is shown before submission.
- The site never asks for contacts, call logs or the gallery. The `Permissions-Policy` header also blocks them.
- Security headers (CSP, HSTS and others) are set in `next.config.ts`. Every form has rate limiting, a
  honeypot, server-side validation and optional Turnstile.
- Analytics (Plausible) load only after the visitor accepts.
