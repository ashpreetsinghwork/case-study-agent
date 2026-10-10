-- Run once in the Supabase SQL editor, same as 0001.
-- Adds an "unlimited" concept: a NULL max_attempts means no cap.

alter table public.user_quota alter column max_attempts drop not null;

create or replace function public.consume_quota(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ok boolean;
begin
  if p_user_id is distinct from auth.uid() then
    return false;
  end if;

  update public.user_quota
  set used_attempts = used_attempts + 1
  where user_id = p_user_id
    and (max_attempts is null or used_attempts < max_attempts)
  returning true into v_ok;

  return coalesce(v_ok, false);
end;
$$;
