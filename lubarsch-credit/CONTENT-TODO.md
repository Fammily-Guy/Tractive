# Content to fill before launch

Everything below is a placeholder on the site today. Tick each item off as you replace it.

## Business details — `config/site.ts`
- [ ] Phone number (`phone`, `phoneHref`)
- [ ] WhatsApp number (`whatsappNumber`, digits only, e.g. 2348012345678)
- [ ] Email address and data-protection email
- [ ] Office address (street, area) and exact map coordinates (`lat`, `lng`)
- [ ] Opening hours
- [ ] **Licence line** — `Licensed as [LICENCE TYPE] by [REGULATOR] — Reg. No. [XXXX]`. Do not claim CBN regulation unless it is true.
- [ ] Repayment bank account (name, number, bank)
- [ ] Social media links
- [ ] Website domain (`url`) and `NEXT_PUBLIC_SITE_URL`
- [ ] Also update the phone/WhatsApp in `public/offline.html` (works without the app, so it can't read the config)

## Loan products — `config/products.ts`
- [ ] **Weekly loan interest rates** (12-week and 16-week) — currently `null`, so the site says "rate being confirmed"
- [ ] Daily loan min / max amount (currently ₦20,000 – ₦500,000, marked "indicative")
- [ ] Weekly loan min / max amount (currently ₦50,000 – ₦1,000,000, marked "indicative")
- [ ] Set `limitsConfirmed: true` once confirmed
- [ ] Confirm the ₦2,000 admin fee and the ₦50 rounding rule
- [ ] Investor notes: confirm the 10% p.a. baseline, the tenors and the reporting cadence

## Numbers and stories
- [ ] Impact numbers — `content/impact.json` (leave as `null` until you have real figures)
- [ ] Customer stories — `content/stories.json`: real stories with **written consent**, then remove `placeholder: true`
- [ ] Team names and roles — `content/team.json`
- [ ] Market list and officer visit days — `content/markets.json`

## Photos — `public/images/` (keep the same file names, or update paths)
- [ ] `placeholder-hero.jpg` — market woman at her stall (Bodija)
- [ ] `placeholder-story-1/2/3.jpg` — customer stories (with consent)
- [ ] `placeholder-team-1..4.jpg` — team portraits
- [ ] `placeholder-office.jpg` — office front with signboard
- [ ] `placeholder-agent.jpg` — field officer with ID card
- [ ] `placeholder-video-poster.jpg` + explainer video URL (`app/[locale]/how-it-works/page.tsx`, `EXPLAINER_VIDEO_URL`)
- [ ] Logo: replace `components/ui/Logo.tsx` and re-run `npm run images` for icons

## Language review
- [ ] **Yoruba** — `locales/yo.json` (first draft; any missing keys show English)
- [ ] **Nigerian Pidgin** — `locales/pcm.json` (first draft)
- [ ] Decide which tagline to use (`taglineKey` in `config/site.ts`)

## Legal review (all marked "DRAFT — requires legal review")
- [ ] Privacy policy — `content/legal/privacy.md` (NDPA 2023, retention periods, DPO contact, identity provider name)
- [ ] Terms of service — `content/legal/terms.md`
- [ ] Fair collection promise — `content/legal/fair-collection.md` (contact hours, complaint response time)
- [ ] Investor risk disclaimer — `locales/en.json` → `investors.disclaimer`
- [ ] FCCPC consumer-lending disclosure requirements — confirm the calculator and review screen meet them
- [ ] Agent commission terms — `locales/en.json` → `agent.benefits`

## Blog
- [ ] Write the 3 draft posts in `content/blog/` and set `draft: false`

## Before going live (technical)
- [ ] Set `DATA_ENCRYPTION_KEY`, `SESSION_SECRET`, `ADMIN_USERS` (with 2FA) — see `.env.example`
- [ ] Create the Supabase project, run `supabase/schema.sql`, set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- [ ] SMS/WhatsApp provider keys (Termii or Twilio), email (Resend)
- [ ] Turnstile keys (spam protection), Plausible domain (optional)
- [ ] For more than one server instance: move rate limits and OTP codes to Redis/Upstash
