-- ============================================================
-- Xeltrix Sparkle — Database schema
-- Run this in Supabase → SQL Editor → New query → Run
-- ============================================================

-- ---------- STAFF ----------
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('cleaner','supervisor','owner')),
  pin_hash text not null,
  phone text,
  language text default 'en' check (language in ('en','ta','hi')),
  active boolean default true,
  created_at timestamptz default now()
);

-- ---------- ROOMS ----------
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  room_no text not null,
  status text not null default 'dirty'
    check (status in ('dirty','cleaning','to_inspect','ready','maintenance')),
  assigned_to uuid references staff(id) on delete set null,
  check_in_time text,
  last_cleaned timestamptz,
  -- cleaning checklist
  floor_ok boolean default false,
  bathroom_ok boolean default false,
  bed_ok boolean default false,
  bin_ok boolean default false,
  ac_ok boolean default false,
  remarks text,
  created_at timestamptz default now()
);

-- ---------- ROOM PHOTOS (many per room) ----------
create table if not exists room_photos (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  url text not null,
  uploaded_by uuid references staff(id) on delete set null,
  created_at timestamptz default now()
);

-- ---------- MAINTENANCE / ISSUES ----------
create table if not exists maintenance (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete set null,
  room_no text,
  issue text not null,
  photo_url text,
  voice_url text,
  reported_by uuid references staff(id) on delete set null,
  reported_name text,
  status text not null default 'open' check (status in ('open','fixed')),
  created_at timestamptz default now(),
  fixed_at timestamptz
);

-- ---------- ATTENDANCE ----------
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete set null,
  staff_name text,
  status text default 'present',
  check_in timestamptz default now(),
  day date default current_date
);

-- ---------- helper: count open maintenance per room ----------
create or replace view rooms_with_open_issues as
select r.*,
  (select count(*) from maintenance m
     where m.room_id = r.id and m.status = 'open') as open_issues
from rooms r;

-- ============================================================
-- ROW LEVEL SECURITY
-- Reads are open (operational data, used for live updates).
-- Writes happen only through the server (service role key),
-- which bypasses RLS. Staff table is NOT readable by clients
-- (so PIN hashes are never exposed).
-- ============================================================
alter table staff enable row level security;
alter table rooms enable row level security;
alter table room_photos enable row level security;
alter table maintenance enable row level security;
alter table attendance enable row level security;

-- public READ for operational tables (enables realtime on client)
create policy "read rooms"        on rooms        for select using (true);
create policy "read room_photos"  on room_photos  for select using (true);
create policy "read maintenance"  on maintenance  for select using (true);
create policy "read attendance"   on attendance   for select using (true);
-- NOTE: no policies on staff -> clients cannot read it. PINs stay safe.

-- enable realtime
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table maintenance;
alter publication supabase_realtime add table attendance;

-- ============================================================
-- STORAGE BUCKETS (run after, or create in Dashboard → Storage)
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('photos','photos', true) on conflict do nothing;
insert into storage.buckets (id, name, public)
  values ('voice','voice', true) on conflict do nothing;
