-- Run once in the Supabase SQL editor, same as 0001/0002.
-- Lightweight project index for the "My case studies" page — actual
-- content stays in Storage (project files), this table just lets the app
-- list "which project ids belong to this user" without scanning Storage.

create table if not exists public.projects (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'generating', -- 'generating' | 'ready' | 'failed'
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_created_at_idx
  on public.projects (user_id, created_at desc);

alter table public.projects enable row level security;

-- Reads go through the user's own session client (RLS enforced); writes
-- always go through the service-role key from server-side pipeline code,
-- which bypasses RLS — so only a select policy is needed here.
drop policy if exists "users can read their own projects" on public.projects;
create policy "users can read their own projects"
  on public.projects for select
  using (auth.uid() = user_id);
