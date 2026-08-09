-- Pin function name resolution to trusted schemas.
alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.is_platform_admin() set search_path = public, pg_temp;
alter function public.is_platform_admin(uuid) set search_path = public, pg_temp;
alter function public.set_app_record_updated_at() set search_path = public, pg_temp;
alter function public.set_permission_updated_at() set search_path = public, pg_temp;
alter function public.app_record_permission(text, text) set search_path = public, pg_temp;
alter function public.set_school_structure_updated_at() set search_path = public, pg_temp;
alter function public.prevent_school_id_change() set search_path = public, pg_temp;
alter function public.app_record_permission_category(text) set search_path = public, pg_temp;
