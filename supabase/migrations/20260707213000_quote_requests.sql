create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  student_count integer not null check (student_count >= 1),
  staff_count integer not null check (staff_count >= 1),
  requested_modules text not null,
  desired_start_period text not null,
  current_systems text not null,
  additional_requirements text not null,
  status text not null default 'new' check (status in ('new', 'in_review', 'quoted', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

create policy "Public can create quote requests"
on public.quote_requests
for insert
to anon, authenticated
with check (true);

create policy "Platform admins can read quote requests"
on public.quote_requests
for select
to authenticated
using (public.is_platform_admin());

create policy "Platform admins can update quote requests"
on public.quote_requests
for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "Platform admins can delete quote requests"
on public.quote_requests
for delete
to authenticated
using (public.is_platform_admin());

create trigger quote_requests_set_updated_at
before update on public.quote_requests
for each row execute function public.set_updated_at();
