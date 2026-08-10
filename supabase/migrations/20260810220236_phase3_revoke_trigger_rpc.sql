-- Trigger functions are internal implementation details, not public RPCs.
revoke execute on function public.validate_attendance_record() from authenticated;
revoke execute on function public.validate_absence_request() from authenticated;
