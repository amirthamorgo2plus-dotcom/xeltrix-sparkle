-- ============================================================
-- Multi-tenant (multi-org) migration
-- Run once in Supabase → SQL Editor (safe to re-run).
-- Adds organizations and scopes every table by org_id.
-- ============================================================

create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- Default org for the existing single-hotel data.
insert into orgs (name, slug)
  values ('Xeltrix Sparkle', 'sparkle')
  on conflict (slug) do nothing;

-- Add org_id to every domain table.
alter table staff               add column if not exists org_id uuid references orgs(id) on delete cascade;
alter table rooms               add column if not exists org_id uuid references orgs(id) on delete cascade;
alter table maintenance         add column if not exists org_id uuid references orgs(id) on delete cascade;
alter table attendance          add column if not exists org_id uuid references orgs(id) on delete cascade;
alter table cleaning_events     add column if not exists org_id uuid references orgs(id) on delete cascade;
alter table push_subscriptions  add column if not exists org_id uuid references orgs(id) on delete cascade;

-- Backfill all existing rows into the default org.
do $$
declare def uuid;
begin
  select id into def from orgs where slug = 'sparkle';
  update staff              set org_id = def where org_id is null;
  update rooms              set org_id = def where org_id is null;
  update maintenance        set org_id = def where org_id is null;
  update attendance         set org_id = def where org_id is null;
  update cleaning_events    set org_id = def where org_id is null;
  update push_subscriptions set org_id = def where org_id is null;
end $$;

create index if not exists staff_org_idx              on staff (org_id);
create index if not exists rooms_org_idx              on rooms (org_id);
create index if not exists maintenance_org_idx        on maintenance (org_id);
create index if not exists attendance_org_idx         on attendance (org_id);
create index if not exists cleaning_events_org_idx    on cleaning_events (org_id);
create index if not exists push_subscriptions_org_idx on push_subscriptions (org_id);

-- Room numbers should be unique per org (not globally).
create unique index if not exists rooms_org_no_idx on rooms (org_id, room_no);

alter table orgs enable row level security;
-- Only the service role (server) touches orgs.
