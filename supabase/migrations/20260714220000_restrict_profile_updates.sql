-- Profile roles and school membership are security-sensitive. Users may read
-- their own profile, but only platform administrators may change profiles.
drop policy if exists "Users can update own profile" on public.profiles;
