-- Run once in the Supabase SQL editor, same as 0001/0002/0003.
-- Logs clicks on the WhatsApp community banner (homepage + /score step) so
-- we can see who clicked "Join community" vs "I'm already in".

create table if not exists public.community_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null check (source in ('homepage', 'score')),
  cta text not null check (cta in ('join', 'already_in')),
  session_id text not null, -- anonymous, device-local id (localStorage) — ties repeat clicks together without requiring sign-in
  user_id uuid references auth.users (id) on delete set null -- set when the visitor happens to be signed in
);

create index if not exists community_clicks_created_at_idx
  on public.community_clicks (created_at desc);

alter table public.community_clicks enable row level security;

-- Writes only ever go through the service-role key from the API route
-- below, which bypasses RLS — no policies needed since nothing reads or
-- writes this table from the browser.
