# Deploy - Vercel Frontend + Supabase Data

Tester architecture for `younginvestors.co.za`: Next.js on Vercel, Supabase for
Auth/Postgres/Storage. Django remains preserved in the repo for a future backend
phase and is not deployed for this tester build.

`MOCK_MVP_PAPER_TRADING_ONLY` - no real money, brokers, banks, FICA, payments,
custody, live order routing, or investment advice.

## 1. Prepare Supabase

Complete [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) first:

- Run `supabase/schema.sql`.
- Keep RLS enabled.
- Configure Email Auth and Google OAuth.
- Add `/login`, `/onboarding`, and `/reset-password` redirect URLs.

## 2. Import Frontend Into Vercel

1. Push the repo to GitHub with no secrets committed.
2. In Vercel, import the GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Use the Next.js framework preset.

## 3. Environment Variables

Set these in Vercel for Production and any Preview environment you use:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
NEXT_PUBLIC_SITE_URL=https://younginvestors.co.za
```

Use the anon public key only. Never set a Supabase `service_role` key in Vercel
for this frontend.

Do not set `NEXT_PUBLIC_API_BASE_URL` for this tester stack.

## 4. Domain

Add both Vercel domains:

- `younginvestors.co.za`
- `www.younginvestors.co.za`

Use the DNS targets Vercel displays. Do not create `api.younginvestors.co.za`
yet; reserve it for the future Django/Azure backend.

## 5. Supabase Auth URLs

In Supabase **Authentication -> URL Configuration**:

- Site URL: `https://younginvestors.co.za`
- Redirect URLs include:
  - `https://younginvestors.co.za/login`
  - `https://younginvestors.co.za/onboarding`
  - `https://younginvestors.co.za/reset-password`
  - `https://www.younginvestors.co.za/login`
  - `https://www.younginvestors.co.za/onboarding`
  - `https://www.younginvestors.co.za/reset-password`

## 6. Production Smoke Test

After redeploy:

1. Run `npm.cmd run verify:supabase` locally or in CI with the same public
   Supabase env values used by Vercel.
2. Visit `/`; it should redirect to `/login`.
3. On `/login`, verify the two lanes:
   - New with us: Google signup and email signup.
   - Already cooking with us: Google sign-in and email sign-in.
4. Create a new email account.
5. If email confirmation is ON, confirm by email and return to `/onboarding`.
6. Complete onboarding and confirm that the app routes to `/academy`.
7. Sign out, then sign in again from `/login`; completed users should enter the app.
8. Open `/reset-password`; request a reset link and confirm the copy is generic.
9. In Supabase, confirm the profile row has `display_name`, `chef_alias`, `age`,
   `intent`, `profile_icon`, `mode`, and `onboarding_completed=true`.
10. Check `/profile` image upload only after the `profile-pictures` bucket is
   configured and RLS/storage policies are present.

`verify:supabase` is read-only and does not create users, send auth emails,
print secrets, or expose tester rows.

## 7. Security Checks

- `.env.local` remains gitignored.
- Browser code uses only `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- RLS is enabled on tester-owned tables.
- Auth, reset, and verification links are never logged.
- No live finance, broker, bank, wallet, payment, or identity-verification flow
  is wired.

## Future Backend Phase

Future architecture:

```text
Vercel frontend -> api.younginvestors.co.za -> Azure Django + Azure PostgreSQL
```

That phase needs a separate architecture/security review before any live finance,
broker, bank, payment, FICA, or identity workflow is introduced.
