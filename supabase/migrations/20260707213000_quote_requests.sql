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

drop policy if exists "Public can create quote requests" on public.quote_requests;
drop policy if exists "Platform admins can read quote requests" on public.quote_requests;
drop policy if exists "Platform admins can update quote requests" on public.quote_requests;
drop policy if exists "Platform admins can delete quote requests" on public.quote_requests;

create policy "Public can create quote requests"
on public.quote_requests
for insert
to anon, authenticated
with check (true);

create policy "Platform admins can read quote requests"
on public.quote_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'platform_admin'
  )
);

create policy "Platform admins can update quote requests"
on public.quote_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'platform_admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'platform_admin'
  )
);

create policy "Platform admins can delete quote requests"
on public.quote_requests
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'platform_admin'
  )
);

create or replace function public.quote_requests_set_updated_at_fn()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quote_requests_set_updated_at on public.quote_requests;
create trigger quote_requests_set_updated_at
before update on public.quote_requests
for each row execute function public.quote_requests_set_updated_at_fn();
