-- ============================================================
-- Super-admin dashboard: last-login, storage usage, app feedback
-- Run once in Supabase → SQL Editor (safe to re-run).
-- ============================================================

alter table orgs add column if not exists last_login_at timestamptz;
alter table orgs add column if not exists storage_bytes bigint default 0;

-- Complaints / feedback about the app, sent by a hotel.
create table if not exists app_feedback (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  staff_id uuid references staff(id) on delete set null,
  staff_name text,
  message text not null,
  resolved boolean default false,
  created_at timestamptz default now()
);
create index if not exists app_feedback_created_idx on app_feedback (created_at);
alter table app_feedback enable row level security;

-- Atomic storage accounting (called from the upload route).
create or replace function add_org_storage(p_org uuid, p_bytes bigint)
returns void language sql as $$
  update orgs set storage_bytes = coalesce(storage_bytes, 0) + p_bytes where id = p_org;
$$;
