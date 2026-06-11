-- ============================================================
-- Issue categories + urgent flag
-- Run once in Supabase → SQL Editor (safe to re-run).
-- ============================================================

alter table maintenance add column if not exists category text;
alter table maintenance add column if not exists urgent boolean default false;

create index if not exists maintenance_category_idx on maintenance (category);
create index if not exists maintenance_urgent_idx on maintenance (urgent);
