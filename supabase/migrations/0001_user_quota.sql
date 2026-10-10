-- Run once in the Supabase dashboard: Project > SQL Editor > New query >
-- paste this whole file > Run. Tracks how many case studies each invited
-- user is allowed to start.

create table if not exists public.user_quota (
  user_id uuid primary key references auth.users (id) on delete cascade,
  max_attempts integer not null default 3,
  used_attempts integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.user_quota enable row level security;

-- Each user can read their own quota row (to show "2 of 3 used" in the
-- UI) but never write it directly — only consume_quota() below can, and
-- only for the calling user's own row.
drop policy if exists "users can read their own quota" on public.user_quota;
create policy "users can read their own quota"
  on public.user_quota for select
  using (auth.uid() = user_id);

-- Atomic check-and-increment, called from the server when a new case
-- study is started. A plain select-then-update from application code
-- could race two concurrent requests past the check; this can't, since
-- the UPDATE's WHERE clause re-checks the limit in the same statement.
-- security definer so it can write despite the select-only RLS policy
-- above; the auth.uid() check keeps it safe to expose to any signed-in
-- caller, since it can only ever touch that caller's own row.
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
    and used_attempts < max_attempts
  returning true into v_ok;

  return coalesce(v_ok, false);
end;
$$;

grant execute on function public.consume_quota(uuid) to authenticated;
