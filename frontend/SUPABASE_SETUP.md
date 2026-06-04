# Supabase Setup — Young Investors Tester Build

This wires the Next.js frontend to a free Supabase project for the public
20–101 chef test: **auth, profiles, Academy scores/attempts, profile images,
Kitchen votes, predictions, and feedback.**

> **Stack for now:** Vercel (frontend) + Supabase (auth/db/storage).
> The Django backend stays in the repo for future production — **do not deploy it now.**
>
> `MOCK_MVP_PAPER_TRADING_ONLY` — no real money, brokers, banks, FICA, or payments.

---

## 1. Create a Supabase project
1. Go to <https://supabase.com> → **New project**.
2. Name it (e.g. `young-investors`), choose a region near South Africa
   (e.g. `eu-west` / `eu-central`), set a strong database password.
3. Wait for it to finish provisioning.

## 2. Copy your keys
**Project → Settings → API**, copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> ⚠️ **Never** copy the `service_role` key into the frontend or this repo.
> The app uses the **anon** key only. RLS (below) is what keeps data safe.

## 3. Run the schema
1. **SQL Editor → New query**.
2. Paste the full contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. **Run**. It is idempotent (safe to re-run).

This creates the tables (`profiles`, `academy_attempts`, `tester_feedback`,
`kitchen_votes`, `prediction_logs`), Row-Level Security policies, the
**chef-number sequence** (testers numbered from **2**; 0 = Gordon, 1 = Sicilia),
and the **`profile-pictures`** storage bucket.

## 4. Confirm the storage bucket
**Storage** should now list a public **`profile-pictures`** bucket. The schema
also added the upload/read policies (each tester can only write to their own
`<user-id>/…` folder; public read is on for the demo).

## 5. Turn OFF email confirmation (recommended for the test)
So 20–101 testers get in instantly with no inbox friction:

**Authentication → Providers → Email** → turn **"Confirm email" OFF** → Save.

- OFF → signup returns a session immediately → straight to `/kitchen`.
- ON  → signup sends a confirmation link; the app routes to a "check your email"
  screen and finishes sign-in when the link is clicked. (Code handles both.)

## 6. Set auth redirect URLs
**Authentication → URL Configuration**:
- **Site URL:** `https://younginvestors.co.za`
- **Redirect URLs** (add all):
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `https://younginvestors.co.za`
  - `https://www.younginvestors.co.za`

## 7. Add environment variables
**Locally** — copy `.env.local.example` → `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
**In Vercel** — set the same three (with `NEXT_PUBLIC_SITE_URL=https://younginvestors.co.za`).
See [`DEPLOY_VERCEL_SUPABASE.md`](./DEPLOY_VERCEL_SUPABASE.md).

## 8. Run + smoke test
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Then verify:
1. **Signup** — `/onboarding` creates an account → lands on `/kitchen`.
2. **Profile** — tap your name/icon (top-left) → `/profile`; edit alias/icon; upload a photo (≤5MB).
3. **Academy** — open Academy → **Submit Practice Attempt** (max 3); score/attempts persist.
4. **Kitchen** — cast a vote; a row appears in `kitchen_votes`.
5. **Reload** — you stay signed in; scores are still there.
6. In Supabase **Table Editor**, confirm rows in `profiles` (with a `member_number` ≥ 2) and `academy_attempts`.

---

## Capacity & chef numbers
- No signup cap is enforced — **well over 30** testers can play; design capacity is **~101**.
- `member_number` is assigned by the `chef_number_seq` sequence (starts at **2**),
  race-safely on insert, so numbers are unique even with simultaneous signups.
- **Chef No. 0 = Gordon, No. 1 = Sicilia** (AI characters; no DB rows).

## Privacy tradeoff (avatars)
The `profile-pictures` bucket is **public-read** for demo simplicity (anyone with the
URL can view an avatar). For production, switch it to private + signed URLs.

## What is NOT here (future Django/Azure)
Beat Gordon content, Recipe Lens, Lounge leaderboard, Vault holdings, Young
Investor Times, and Gordon/Sicilia scripts stay as **local mock data** — they
don't need a database for the test. Server-side governance moves to Django +
Azure PostgreSQL after the tester proof. See [`DEPLOY_VERCEL_SUPABASE.md`](./DEPLOY_VERCEL_SUPABASE.md).
