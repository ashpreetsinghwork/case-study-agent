# Deploying

This app needs to run on an **always-on Node server**, not a serverless
platform (Vercel, Netlify Functions, etc.) — new case studies run as a
background job that keeps working after the HTTP response is sent
(`src/app/api/projects/route.ts`), and serverless platforms can freeze or
kill the process once a response goes out, cutting the pipeline off
mid-run. Railway, Render, and Fly.io all give you a plain long-running
container, any of them works; these steps use Railway as the concrete
example.

## 1. One-time Supabase setup

You're already using Supabase for file storage. Two more things need
turning on there before deploying.

**Run the quota migration.** In the Supabase dashboard: **SQL Editor → New
query**, paste the contents of `supabase/migrations/0001_user_quota.sql`,
and run it. This creates the table tracking how many case studies each
invited user can start.

**Turn off public signup.** Dashboard: **Authentication → Providers →
Email**, turn off "Allow new users to sign up." This is what makes the app
invite-only — without it, anyone who finds the login page could sign
themselves up. Users are added one at a time via `scripts/invite-user.ts`
instead (see below), which creates them directly regardless of this
setting.

**Get your anon key.** Dashboard: **Project Settings → API**. Copy the
`anon` `public` key (not the service role key you already have) — you'll
need it as `NEXT_PUBLIC_SUPABASE_ANON_KEY` below. It's safe to expose in
the browser; row-level security on the `user_quota` table is what actually
restricts what it can do.

**Add the redirect URL.** Dashboard: **Authentication → URL
Configuration → Redirect URLs**, add
`https://<your-deployed-domain>/auth/callback` (and keep
`http://localhost:3000/auth/callback` there too for local dev). Without
this, the magic-link email will redirect somewhere Supabase refuses.

**Set the Site URL too — this is a separate field on the same page.**
Still on **Authentication → URL Configuration**, change **Site URL**
(not the Redirect URLs list above it) from its default
`http://localhost:3000` to your real deployed domain, e.g.
`https://your-app.up.railway.app`. This is what the magic-link email
actually uses as its base — leaving it on localhost is why the sign-in
button can land on `localhost` even after deploying.

## 1b. One-time Resend setup

Used for two things: emailing a user their case study (link + PDF
attached) once it's ready, and — once wired into Supabase below — sending
the actual sign-in/invite emails too.

Sign up at [resend.com](https://resend.com) (free tier is enough for
light use) and copy an API key from **API Keys**. That's
`RESEND_API_KEY` below. You can leave `EMAIL_FROM` blank at first, it
defaults to Resend's sandbox sender, which works immediately with no
setup but looks like it's from Resend rather than you; verify your own
domain in Resend's dashboard later and set `EMAIL_FROM` once you want a
real "from" address.

## 1c. Point Supabase's auth emails through Resend (do this — not optional)

Supabase's own built-in mailer (what sends invite and magic-link emails
by default) has a very low hourly send cap and is explicitly meant for
testing only, not real use. A handful of invites + sign-in attempts will
exhaust it and start failing with "email rate limit exceeded." Fix it
once, here:

1. Supabase dashboard → **Project Settings → Authentication → SMTP
   Settings** → toggle on **Enable Custom SMTP**.
2. Fill in:
   - **Sender email**: `onboarding@resend.dev` (or your own verified
     domain in Resend, once you've set one up)
   - **Sender name**: whatever you want invite/sign-in emails to show as
     the "from" name
   - **Host**: `smtp.resend.com`
   - **Port**: `587`
   - **Username**: `resend` (literally the word "resend")
   - **Password**: your Resend API key (same value as `RESEND_API_KEY`)
3. Save.

That's it — auth emails (invites, magic links) now send through Resend's
much higher limits instead of Supabase's default ones. No other setting
or code change needed; this only changes how Supabase sends its own
emails, nothing about how the app sends the "case study is ready" email
(that already goes through Resend directly via `src/lib/email.ts`).

## 2. Environment variables

Same list as `.env.example`, set in Railway's dashboard (or `railway
variables set`) rather than committed:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=        # same value as SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # the anon key from step 1
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=               # optional, defaults to gpt-4.1
OPENAI_IMAGE_MODEL=              # optional
RESEND_API_KEY=                  # from step 1b
EMAIL_FROM=                      # optional, defaults to Resend's sandbox sender
NEXT_PUBLIC_APP_URL=             # your deployed domain, e.g. https://your-app.up.railway.app
```

`INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` aren't needed for this
deployment path — the pipeline runs in-process, not through Inngest Cloud.

## 3. Deploy to Railway

1. Push this repo to GitHub if it isn't already.
2. [railway.app](https://railway.app) → **New Project → Deploy from GitHub
   repo** → pick this repo. Railway auto-detects Next.js and runs
   `npm run build` / `npm run start`.
3. Add the environment variables from step 2 in the Railway dashboard
   (**Variables** tab).
4. Once it deploys, Railway gives you a `*.up.railway.app` domain —
   that's the domain to add to Supabase's redirect URLs (step 1) if you
   haven't already. Add a custom domain later if you want one.

## 4. Invite your first user

From your machine, with `.env` filled in locally:

```bash
npx tsx --env-file=.env scripts/invite-user.ts you@example.com 10
```

This creates the account, sends a sign-in link to that email, and gives
them 10 case study attempts. They click the link, land on the deployed
app already signed in.

## Managing users after that

```bash
# invite someone new, with their starting quota
npx tsx --env-file=.env scripts/invite-user.ts person@example.com 5

# change an existing user's limit (and optionally reset usage back to 0)
npx tsx --env-file=.env scripts/set-user-quota.ts person@example.com 20
npx tsx --env-file=.env scripts/set-user-quota.ts person@example.com 20 reset
```

There's no admin UI for this yet, these are plain scripts run from your
own machine against the Supabase project. Fine for a small invite list;
worth a real admin page if the user list grows past a handful of people.
