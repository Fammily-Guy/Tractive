-- Lubarsch Credit — Supabase / Postgres schema
-- Run in the Supabase SQL editor. The website talks to these tables with the
-- service-role key from the server only; RLS below protects direct access from
-- browsers and lets you add Supabase Auth for staff later.

create extension if not exists pgcrypto;

-- ── Reference numbers: LBC-2026-000123 ────────────────────────────────
create sequence if not exists application_seq;

create or replace function next_application_reference() returns text
language sql as $$
  select 'LBC-' || to_char(now() at time zone 'Africa/Lagos', 'YYYY') || '-' || lpad(nextval('application_seq')::text, 6, '0');
$$;

-- ── Applications ─────────────────────────────────────────────────────
create table if not exists applications (
  id               uuid primary key default gen_random_uuid(),
  reference        text not null unique default next_application_reference(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  status           text not null default 'received'
                   check (status in ('received','under_review','visit_scheduled','approved','disbursed','declined')),
  applicant        jsonb not null,          -- no BVN / ID number in here
  bvn_enc          text not null,           -- AES-256-GCM, encrypted by the app (DATA_ENCRYPTION_KEY)
  id_number_enc    text not null,
  quote            jsonb,
  assigned_officer text,
  documents        jsonb not null default '[]'::jsonb,
  notes            jsonb not null default '[]'::jsonb,
  history          jsonb not null default '[]'::jsonb,
  locale           text not null default 'en'
);

create index if not exists applications_status_idx  on applications (status);
create index if not exists applications_created_idx on applications (created_at desc);
create index if not exists applications_phone_idx   on applications ((applicant->>'phone'));
create index if not exists applications_market_idx  on applications ((applicant->>'market'));

-- ── Inbox: callbacks, messages, investor enquiries, agent sign-ups ───
create table if not exists inbox (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('callback','message','investor','agent')),
  created_at timestamptz not null default now(),
  handled    boolean not null default false,
  payload    jsonb not null
);
create index if not exists inbox_kind_idx on inbox (kind, created_at desc);

-- ── Staff (for when you move login to Supabase Auth) ─────────────────
create table if not exists staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email   text not null unique,
  name    text not null,
  role    text not null check (role in ('admin','officer','viewer'))
);

create or replace function staff_role() returns text
language sql stable security definer set search_path = public as $$
  select role from staff where user_id = auth.uid();
$$;

-- ── Row Level Security ───────────────────────────────────────────────
-- Anonymous visitors get NO direct access. The public website writes through
-- its own server (service role bypasses RLS) after validation and rate limiting.
alter table applications enable row level security;
alter table inbox        enable row level security;
alter table staff        enable row level security;

drop policy if exists staff_read_applications on applications;
create policy staff_read_applications on applications
  for select to authenticated
  using (staff_role() in ('admin','viewer') or (staff_role() = 'officer' and assigned_officer = auth.jwt()->>'email'));

drop policy if exists staff_update_applications on applications;
create policy staff_update_applications on applications
  for update to authenticated
  using (staff_role() = 'admin' or (staff_role() = 'officer' and assigned_officer = auth.jwt()->>'email'));

drop policy if exists staff_read_inbox on inbox;
create policy staff_read_inbox on inbox for select to authenticated using (staff_role() is not null);

drop policy if exists staff_update_inbox on inbox;
create policy staff_update_inbox on inbox for update to authenticated using (staff_role() in ('admin','officer'));

drop policy if exists staff_read_self on staff;
create policy staff_read_self on staff for select to authenticated using (user_id = auth.uid() or staff_role() = 'admin');

-- ── Storage bucket for uploaded ID photos (private) ──────────────────
insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

-- ── Retention helper (NDPA) — schedule with pg_cron once periods are confirmed ──
-- delete from applications where status = 'declined' and updated_at < now() - interval '[X] months';
