-- Run once in the Supabase SQL editor, same as 0001-0004.
-- One row per finished /score run: their answers, the resulting score, and
-- whether they'd clicked the WhatsApp community CTA (joined via
-- community_clicks, matched by the same anonymous session_id).

create table if not exists public.scorecard_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null, -- same anonymous, device-local id used by community_clicks
  user_id uuid references auth.users (id) on delete set null, -- set when the visitor happens to be signed in
  answers jsonb not null, -- raw quiz answers, e.g. {"0_1": true, ...}
  scores int[] not null, -- per-theme 0-5 problem counts (self-reported, or from a portfolio scan)
  total int not null,
  percent int not null,
  band text not null,
  summary text, -- portfolio-scan summary, null when self-reported only
  theme_fixes jsonb, -- portfolio-scan personalized fixes, null when self-reported only
  analyze_error text, -- set when a portfolio scan was attempted but failed
  joined_community boolean not null default false
);

create index if not exists scorecard_submissions_created_at_idx
  on public.scorecard_submissions (created_at desc);

create index if not exists scorecard_submissions_session_id_idx
  on public.scorecard_submissions (session_id);

alter table public.scorecard_submissions enable row level security;

-- Writes only ever go through the service-role key from the API route
-- below, which bypasses RLS — no policies needed since nothing reads or
-- writes this table from the browser.
