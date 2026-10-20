-- Run once in the Supabase SQL editor, same as 0001-0005.
-- Links a submission to its archived upload, when one exists (only set when
-- a portfolio scan ran). The actual files live in the existing
-- "case-study-projects" storage bucket, under scorecard/{upload_id}/ —
-- homepage.html, case-study.html, and resume-<filename> if one was given.

alter table public.scorecard_submissions
  add column if not exists upload_id text;
