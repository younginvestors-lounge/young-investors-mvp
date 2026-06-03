# Young Investors Frontend Handoff

---

## 2026-06-03 — Local Auth Integration (frontend ↔ Django) — VERIFIED

**Status:** Real authentication is wired and verified locally end-to-end. No Azure
deployment performed. Still `MOCK_MVP_PAPER_TRADING_ONLY` — no real money, broker,
bank, FICA, or live trading.

### What now works (proven by automated HTTP tests against the live dev server)
- **Signup** (`POST /api/auth/signup/`): atomic user + seat + verification-token
  creation; email normalised to lowercase; profile icon saved at creation; a unique
  **join number** ("Chef #N") allocated race-safely via `select_for_update`.
- **Email verification** (`POST /api/auth/verify_email/`): token-based, 24h expiry,
  one-time use. The verification link is included in the email body and printed to
  the Django console in local dev (console email backend).
- **Login** (`POST /api/auth/login/`): email-first (case-insensitive) via a custom
  `EmailBackend`; returns JWT access (24h) + refresh (7d); blocks unverified users
  with `403 {code: "email_unverified"}`.
- **Token refresh** (`POST /api/token/refresh/`): the frontend API client refreshes
  the access token transparently on a 401 and retries once.
- **Password reset** (`request` + `confirm`): tokenised, 2h expiry, **no email
  enumeration** (always returns a generic 200).
- **Profile** (`GET /api/auth/me/`, `PATCH /api/auth/update_profile/`): update
  chef_alias, age, intent, profile_icon, and profile_picture (≤5MB, image types
  validated). Media served at `/media/` in DEBUG; absolute URLs resolved client-side.
- **CORS**: preflight verified for `http://localhost:3000` (credentials + PATCH/POST).
- **Permissions**: DRF default restored to `IsAuthenticated`; auth endpoints are
  explicitly public via `AuthViewSet.get_permissions`.

### Frontend additions
- `lib/api-client.ts` — typed client: structured `ApiError` (field + message),
  request timeout, transparent token refresh, multipart profile upload, media URL
  resolution.
- `lib/auth-context.tsx` — `AuthProvider` + `useAuth()` (single shared session;
  wired in `app/layout.tsx`). Only drops the session on a real 401, not network blips.
- `lib/profileIcons.tsx` — shared icon catalog (keys match backend choices).
- Pages: `/signin` (real email+password form), `/verify-email`, `/reset-password`
  (dual mode), and a rebuilt `/onboarding` (alias → age → intent → icon → email/
  password → signup → verify-email).
- `components/TopBar.tsx` — shows the chef's icon, alias, and **Chef No. NNNN**;
  logout uses the auth context.
- `components/AppShell.tsx` — auth-guarded; unauthenticated visitors are sent to
  `/signin`; chef alias comes from the live session.

### Verified flow
`/login` (splash) → `/onboarding` (creates real account) → `/verify-email`
(click console link locally) → `/signin` → `/kitchen` (guarded, shows Chef No.).
Returning authenticated users skip the splash straight to `/kitchen`.

### How to run locally
1. Backend: `pip install -r requirements.txt` → `python manage.py migrate` →
   `python manage.py runserver 127.0.0.1:8000`
2. Frontend: `frontend/.env.local` contains `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`;
   then `npm install` && `npm run dev` (→ http://localhost:3000).
3. On signup, copy the verification link from the **Django console** to verify.

### Known follow-ups (not blockers for local proof)
- Verification/reset emails are console-only in DEBUG; SendGrid wires in for prod.
- `/gordon-intro` still reads localStorage and is currently outside the auth path
  (orphaned, not broken) — fold into the post-verify journey in a later pass.
- Kitchen/Academy/Vault/Shop/Lounge still render mock data; backend data wiring is
  Phases 2–7.

### Azure staging checklist (DO NOT deploy until approved)
- [ ] Generate a strong `SECRET_KEY` ≥ 32 bytes (dev key triggers JWT length warning).
- [ ] Create Azure Database for PostgreSQL Flexible Server; set `DATABASE_URL`
      (`?sslmode=require`); add the App Service outbound IP to the DB firewall.
- [ ] Azure App Service (Python 3.13 or container via the included `Dockerfile`).
- [ ] App settings: `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`,
      `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`, `SENDGRID_API_KEY`, `DEFAULT_FROM_EMAIL`.
- [ ] Switch email backend to SendGrid (already auto-selected when `DEBUG=False`);
      verify sender domain in SendGrid.
- [ ] `python manage.py migrate` + `collectstatic` on the App Service.
- [ ] Vercel: set `NEXT_PUBLIC_API_BASE_URL` to the App Service HTTPS URL.
- [ ] Smoke test signup → verify → login → profile → kitchen on staging.
- [ ] Confirm no real-money path is wired (switched-off boundary intact).

---

## Routing Recovery Update

- Extracted the working dashboard from `frontend/app/page.tsx` into `frontend/components/AppShell.tsx`.
- Preserved the existing dashboard behavior inside `AppShell`:
  - Kitchen remains the default active tab.
  - Bottom navigation still switches between Kitchen, Academy, Vault, Shop, and Lounge.
  - Kitchen voting, Academy clearance, Vault, Shop, and Lounge content were not rewritten.
- Replaced `frontend/app/page.tsx` with a simple redirect to `/login`.
- Added `frontend/app/kitchen/page.tsx`, which renders `AppShell`.
- Did not touch backend files.
- Did not alter global CSS or redesign the dashboard.
- Did not replace `frontend/app/login/page.tsx` because the exact old onboarding code was not present in the repo or current visible thread. The current `/login` page is still the temporary minimal login page and must be replaced with the exact pasted onboarding code when provided.
- Verification:
  - `npm.cmd exec tsc -- --noEmit --pretty false` passes.
  - `npm.cmd run build` passes.
  - Next build now reports routes for `/`, `/login`, and `/kitchen`.

## Latest Surgical Fix

- Read `CLAUDE.md` before editing.
- Inspected `frontend/app` and `frontend/pages`.
- Found no existing login route:
  - `frontend/app/login/page.tsx` did not exist.
  - `frontend/pages/login.tsx` did not exist.
  - No login/auth component existed in source outside generated files.
- Created the minimal correct App Router route at `frontend/app/login/page.tsx`.
- Tightened the main wordmark from a serif display treatment to a lowercase bold grotesk style:
  - `font-family: var(--yi-sans)`
  - `font-weight: 900`
  - `letter-spacing: -0.055em`
  - `line-height: 0.88`
- Added a visible sharp `Login` link in `frontend/components/BrutalistHeader.tsx`.
- Confirmed `http://127.0.0.1:3000` returns HTTP 200 and includes the `/login` link.
- Confirmed `http://127.0.0.1:3000/login` returns HTTP 200 and includes `Back to Young Investors`.
- No backend files were touched.

## What Changed

- Tightened the main wordmark to a lowercase, premium grotesk style with negative letter spacing.
- Added a visible sharp `Login` link in the app header that routes to `/login`.
- Added the minimal App Router login route at `frontend/app/login/page.tsx` because no login route or login component existed in source.
- Added a `Back to Young Investors` link on the login page.
- Fixed the frontend build blocker by removing the missing `ServiceWorkerRegistrar` import and render from `frontend/app/layout.tsx`.
- Removed the missing `/manifest.json` metadata reference from `frontend/app/layout.tsx`.
- Removed `next/font/google` usage from `frontend/app/layout.tsx` so the demo no longer needs network access to fetch fonts during build.
- Replaced Next font CSS variables with local/system font stacks in `frontend/app/globals.css`.
- Updated Vault chart font references to use the existing `--yi-mono` design token.
- Updated the execution mode constant to `MOCK_MVP_PAPER_TRADING_ONLY`.
- Updated the Gordon progress panel paper-mode label to `MOCK_MVP_PAPER_TRADING_ONLY`.

## Files Edited

- `frontend/app/layout.tsx`
- `frontend/app/globals.css`
- `frontend/app/page.tsx`
- `frontend/app/kitchen/page.tsx`
- `frontend/app/login/page.tsx`
- `frontend/components/AppShell.tsx`
- `frontend/components/BrutalistHeader.tsx`
- `frontend/components/VaultView.tsx`
- `frontend/components/KitchenGordonPanel.tsx`
- `frontend/lib/types.ts`
- `HANDOFF.md`

No backend files were edited.

## What Works

- `npm.cmd exec tsc -- --noEmit --pretty false` passes.
- `npm.cmd run build` passes.
- A bounded dev-server probe returned HTTP 200 from `http://127.0.0.1:3000`.
- The dev server was started for this handoff and returned HTTP 200 from `http://127.0.0.1:3000`.
- The app shell renders through `frontend/app/page.tsx`.
- The reusable app shell now lives at `frontend/components/AppShell.tsx`.
- `/` redirects to `/login`.
- `/kitchen` renders the main app shell with Kitchen selected by default.
- The login route is `frontend/app/login/page.tsx` and is available at `/login`.
- The main header now links to `/login`.
- The login page includes a route back to `/`.
- Bottom navigation wires all five sections:
  - Kitchen
  - Academy
  - Vault
  - Shop
  - Lounge
- Kitchen voting still uses shared domain logic through `calculateConsensus`.
- The 60% Rule is visualized through `ConsensusBar`.
- Academy clearance is visible and gates Kitchen voting until required lessons are complete.
- Vault, Shop, and Lounge use local mock data only.
- The frontend keeps the Sicilia direction: mostly white, black accent, sharp corners, no gradients, no shadows, and red reserved for risk/critical states.

## What Remains

- Next still warns about duplicate lockfiles:
  - `package-lock.json`
  - `frontend/package-lock.json`
- Git status cannot currently be trusted from the repo root because `.git` appears incomplete or malformed.
- There is no browser automation test installed, so tab navigation was verified by source inspection plus an HTTP 200 dev-server probe.
- No real PWA service worker or manifest exists now. That is fine for the current investor-demo priority.
- There was no pre-existing login page or login component in source; the current login page is intentionally minimal and mock-only.
- The exact old onboarding code still needs to be pasted/integrated into `frontend/app/login/page.tsx`.

## Commands To Run

From the repo root:

```powershell
cd frontend
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Open:

```text
http://localhost:3000
```

Login route:

```text
http://localhost:3000/login
```

Kitchen route:

```text
http://localhost:3000/kitchen
```

Verification commands:

```powershell
cd frontend
npm.cmd exec tsc -- --noEmit --pretty false
npm.cmd run build
```

Note: use `npm.cmd` on this Windows machine because direct `npm` may be blocked by PowerShell execution policy.

## Next Recommended Steps

1. Run a manual demo pass in the browser across all five sections.
2. In Academy, complete the required lesson so Kitchen voting unlocks, then test YES/NO vote toggling and the 60% Rule visual.
3. Test the header Login link, then use `Back to Young Investors` from `/login`.
4. Decide whether to remove the root `package-lock.json` or configure `outputFileTracingRoot` in `frontend/next.config.ts` to silence the duplicate-lockfile warning.
5. Add a tiny smoke test later if browser test tooling is introduced.
6. Continue polish only after the current demo is stable: stronger first-screen composition, richer Kitchen recipe states, and a concise investor-meeting narrative path.
