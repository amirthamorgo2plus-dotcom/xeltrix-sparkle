-- ============================================================
-- Reports / analytics migration
-- Run this once in Supabase → SQL Editor (safe to re-run).
-- Adds time-taken tracking and an event log for redos/approvals.
-- ============================================================

-- When a room was (re)assigned to a cleaner — used to measure time taken.
alter table rooms add column if not exists assigned_at timestamptz;

-- Per-event log: one row each time a room is cleaned / sent back / approved.
create table if not exists cleaning_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete set null,
  room_no text,
  cleaner_id uuid references staff(id) on delete set null,
  cleaner_name text,
  event text not null check (event in ('cleaned','redo','approved')),
  duration_secs integer,            -- set on 'cleaned' = assigned_at → now
  created_at timestamptz default now()
);

create index if not exists cleaning_events_created_idx on cleaning_events (created_at);
create index if not exists cleaning_events_cleaner_idx on cleaning_events (cleaner_id);

alter table cleaning_events enable row level security;
drop policy if exists "read cleaning_events" on cleaning_events;
create policy "read cleaning_events" on cleaning_events for select using (true);
