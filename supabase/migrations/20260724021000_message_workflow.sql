-- Transactional creation of direct and group conversations. Participants can
-- only be selected from the actor's own school.

create or replace function public.create_school_conversation(
  _subject text,
  _body text,
  _participant_emails text[],
  _kind text default 'direct'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_school_id uuid := public.current_school_id();
  conversation_id uuid;
  requested_count integer;
  matched_count integer;
begin
  if actor_school_id is null then raise exception 'Je account is niet aan een school gekoppeld'; end if;
  if not public.has_permission('messages.create') then
    raise exception 'Je hebt geen recht om berichten te versturen';
  end if;
  if length(trim(_subject)) < 1 then raise exception 'Vul een onderwerp in'; end if;
  if length(trim(_body)) < 1 then raise exception 'Vul een bericht in'; end if;
  if _kind not in ('direct','group','class','announcement') then
    raise exception 'Ongeldig gesprekstype';
  end if;

  select count(distinct lower(trim(email)))
  into requested_count
  from unnest(coalesce(_participant_emails, '{}'::text[])) email
  where trim(email) <> '' and lower(trim(email)) <> lower((select email from public.profiles where id = auth.uid()));

  select count(*)
  into matched_count
  from public.profiles profile
  where profile.school_id = actor_school_id
    and lower(profile.email) in (
      select distinct lower(trim(email))
      from unnest(coalesce(_participant_emails, '{}'::text[])) email
      where trim(email) <> ''
    )
    and profile.id <> auth.uid();

  if requested_count = 0 then raise exception 'Voeg minimaal één ontvanger toe'; end if;
  if matched_count <> requested_count then
    raise exception 'Een of meer ontvangers zijn niet gevonden binnen deze school';
  end if;

  insert into public.conversations (school_id, subject, kind, created_by)
  values (actor_school_id, trim(_subject), _kind, auth.uid())
  returning id into conversation_id;

  insert into public.conversation_participants (conversation_id, profile_id, participant_role)
  values (conversation_id, auth.uid(), 'owner');

  insert into public.conversation_participants (conversation_id, profile_id, participant_role)
  select conversation_id, profile.id, 'member'
  from public.profiles profile
  where profile.school_id = actor_school_id
    and lower(profile.email) in (
      select distinct lower(trim(email))
      from unnest(_participant_emails) email
      where trim(email) <> ''
    )
    and profile.id <> auth.uid();

  insert into public.messages (school_id, conversation_id, sender_id, body)
  values (actor_school_id, conversation_id, auth.uid(), trim(_body));

  return conversation_id;
end;
$$;

revoke all on function public.create_school_conversation(text,text,text[],text) from public;
grant execute on function public.create_school_conversation(text,text,text[],text) to authenticated;

create or replace function public.send_school_message(_conversation_id uuid, _body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  message_id uuid;
  conversation_school_id uuid;
begin
  if length(trim(_body)) < 1 then raise exception 'Vul een bericht in'; end if;
  if not public.is_conversation_participant(_conversation_id) then
    raise exception 'Je bent geen deelnemer van dit gesprek';
  end if;

  select school_id into conversation_school_id
  from public.conversations
  where id = _conversation_id and closed_at is null;
  if conversation_school_id is null then raise exception 'Gesprek is gesloten of bestaat niet'; end if;

  insert into public.messages (school_id, conversation_id, sender_id, body)
  values (conversation_school_id, _conversation_id, auth.uid(), trim(_body))
  returning id into message_id;
  return message_id;
end;
$$;

revoke all on function public.send_school_message(uuid,text) from public;
grant execute on function public.send_school_message(uuid,text) to authenticated;

