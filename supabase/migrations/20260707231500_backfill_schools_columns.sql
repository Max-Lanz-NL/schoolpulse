alter table if exists public.schools
  add column if not exists address text;

alter table if exists public.schools
  add column if not exists contact_email text;

alter table if exists public.schools
  add column if not exists created_at timestamptz not null default now();
