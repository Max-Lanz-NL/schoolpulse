-- The trigger must be able to validate cross-table ownership even when the
-- acting parent/student cannot directly select the referenced profile row.
alter function public.validate_operation_reference() security definer;
alter function public.validate_operation_reference() set search_path = public;
revoke execute on function public.validate_operation_reference() from public, anon, authenticated;
