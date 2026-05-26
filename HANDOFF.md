# Young Investors Frontend Handoff

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
