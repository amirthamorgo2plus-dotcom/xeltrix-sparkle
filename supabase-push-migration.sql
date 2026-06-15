-- ============================================================
-- Web push subscriptions
-- Run once in Supabase → SQL Editor (safe to re-run).
-- ============================================================

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete cascade,
  role text,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

create index if not exists push_subscriptions_role_idx on push_subscriptions (role);
create index if not exists push_subscriptions_staff_idx on push_subscriptions (staff_id);

alter table push_subscriptions enable row level security;
-- No public policies — only the service role (server) reads/writes these.
