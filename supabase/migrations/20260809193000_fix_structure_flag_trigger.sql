-- NEW is a polymorphic record. Reading a column that is absent on the other
-- trigger table raises an error before PL/pgSQL can safely finish the branch.
create or replace function public.normalize_single_school_structure_flag()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  row_data jsonb := to_jsonb(new);
begin
  if tg_table_name = 'school_years' and coalesce((row_data->>'is_current')::boolean, false) then
    update public.school_years set is_current = false
    where school_id = new.school_id and id <> new.id and is_current;
  elsif tg_table_name = 'school_locations'
    and coalesce((row_data->>'is_main')::boolean, false)
    and coalesce((row_data->>'is_active')::boolean, false) then
    update public.school_locations set is_main = false
    where school_id = new.school_id and id <> new.id and is_main;
  end if;
  return new;
end;
$$;
