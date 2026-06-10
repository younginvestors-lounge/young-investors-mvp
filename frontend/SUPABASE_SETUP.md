# Supabase Setup - Young Investors Tester Build

This wires the Next.js frontend to Supabase for the public tester stack:
auth, profiles, onboarding status, Academy attempts, profile images, Kitchen
votes, predictions, and feedback.

`MOCK_MVP_PAPER_TRADING_ONLY` - no real money, broker APIs, bank APIs, FICA,
payments, custody, live order routing, or investment advice.

## 1. Create a Supabase Project

1. Go to <https://supabase.com> and create a project.
2. Choose a region close to South Africa where practical.
3. Set a strong database password and wait for provisioning.

## 2. Copy Browser-Safe Keys

In Supabase, open **Project Settings -> API** and copy:

- `NEXT_PUBLIC_SUPABASE_URL` from the Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the anon public key.

Never copy the `service_role` key into the frontend, Vercel, screenshots, logs,
docs, or this repo.

## 3. Run the Schema

1. Open **SQL Editor -> New query**.
2. Paste the full contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Run it.

The schema is idempotent. It creates/updates:

- `profiles` with `email`, `display_name`, `chef_alias`, `age`, `intent`,
  `profile_icon`, `profile_picture_url`, `mode`, `onboarding_completed`,
  scores, rank, credential status, timestamps, and the chef-number sequence.
- Own-row RLS policies for profile select/insert/update.
- Academy, Kitchen, prediction, feedback tables and policies.
- `profile-pictures` storage bucket and user-scoped upload policies.
- `chef_alias` as a non-unique public display name. The unique identity anchor is
  the system-assigned `member_number`.

## 4. Configure Auth

### Email

**Recommended for public testing:** keep email confirmation ON.

- ON: signup sends a confirmation email, then returns the user to onboarding.
- OFF: signup creates a session immediately, then routes to onboarding.

The app supports both, but public testing is cleaner with confirmation enabled.

### Google OAuth

In **Authentication -> Providers -> Google**:

1. Enable Google.
2. Add the Google client ID and secret from Google Cloud Console.
3. In Google Cloud, allow the callback URL Supabase shows for the provider.

Google sign-in and Google sign-up are the same Supabase OAuth operation. The UI
shows separate "new" and "returning" lanes, but both land on `/onboarding` so
new profiles finish setup and returning profiles are routed onward.

### URL Configuration

In **Authentication -> URL Configuration**:

- Site URL: `https://younginvestors.co.za`
- Redirect URLs:
  - `http://localhost:3000/login`
  - `http://localhost:3000/onboarding`
  - `http://localhost:3000/reset-password`
  - `https://younginvestors.co.za/login`
  - `https://younginvestors.co.za/onboarding`
  - `https://younginvestors.co.za/reset-password`
  - `https://www.younginvestors.co.za/login`
  - `https://www.younginvestors.co.za/onboarding`
  - `https://www.younginvestors.co.za/reset-password`

## 5. Environment Variables

Local `.env.local`:

```powershell
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Vercel production:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
NEXT_PUBLIC_SITE_URL=https://younginvestors.co.za
```

Do not set `NEXT_PUBLIC_API_BASE_URL` for this tester stack. Django remains in
the repo for the future production backend and is not deployed now.

## 6. Smoke Test

Run:

```powershell
cd frontend
npm.cmd install
npm.cmd run verify:supabase
npm.cmd run dev
```

Verify:

1. `npm.cmd run verify:supabase` passes against the live Supabase project.
2. `/` redirects to `/login`.
3. `/login` shows two clear lanes:
   - New with us: Google signup or email signup.
   - Already cooking with us: Google sign-in or email sign-in.
4. Email signup collects email, password, display name, and Chef alias.
5. Confirmed or instant-session users land on `/onboarding`.
6. Onboarding collects display name, Chef alias, age, intent, icon, and final
   confirmation, then sets `onboarding_completed=true` and routes to `/academy`.
7. Returning users with `onboarding_completed=true` land in the app.
8. Returning users without completed onboarding are sent back to `/onboarding`.
9. `/reset-password` sends a generic reset email and never exposes whether the
   email exists.
10. `/profile` can update alias/icon and upload a profile image when storage is
   configured.
11. Supabase Table Editor shows `profiles` rows with `member_number >= 3` and
    RLS remains enabled.

`verify:supabase` is read-only. It checks env presence, Supabase Auth settings,
Google OAuth status, email confirmation policy, recovered `profiles` columns,
and the profile-picture bucket without creating users or printing secrets.

## Notes

- Chef No. 001 is Gordon and Chef No. 002 is Sicilia. Real testers start at Chef No. 003.
- The `profile-pictures` bucket is public-read for the tester build. For
  production, switch to private storage with signed URLs.
- Under-18 users are kept in `training_kitchen` mode. The app does not collect
  banking, broker, payment, or identity-verification data.
