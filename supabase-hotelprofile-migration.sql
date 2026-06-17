-- ============================================================
-- Hotel profile: logo + location
-- Run once in Supabase → SQL Editor (safe to re-run).
-- ============================================================

alter table orgs add column if not exists logo_url text;
alter table orgs add column if not exists address text;
alter table orgs add column if not exists lat double precision;
alter table orgs add column if not exists lng double precision;
