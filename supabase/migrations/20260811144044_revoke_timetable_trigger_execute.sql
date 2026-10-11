-- Timetable validators are trigger-only implementation details. They execute
-- through their table triggers and must not be exposed as authenticated RPCs.
revoke all on function public.validate_timetable_entry() from public, anon, authenticated;
revoke all on function public.validate_substitution() from public, anon, authenticated;
