# Deploy Handoff — get `/join` live (domain-pinning fix)

**Date:** 2026-06-06 · **Branch:** `feature/sicilia-rebuild` · **For:** Carl / CEO

## TL;DR
The `/join` "Join The Syndicate" install splash is **finished, committed, and pushed**
(commit `332aee7`, plus a cleanup commit). It **builds green** locally
(`/join` = 3.33 kB). It is **not yet on `younginvestors.co.za`** for ONE reason:
the Vercel **domain is pinned to an old deployment** that predates `/join`.
This is a **dashboard action, not a code fix** — I cannot do it from here.

## Proof of the diagnosis
- `curl -I https://younginvestors.co.za/join` → `HTTP 404`, `X-Matched-Path: /404`
  → the build serving the domain has no `/join` route.
- Local `next build` lists `/join` fine → the code is correct.
- The live `/manifest.webmanifest` still shows the old `app/manifest.ts` content
  (`short_name: "YI Kitchen"`, `start_url: "/login"`) → confirms an **old build** is live.

## THE FIX (pick one — B is the real fix)

**A. Quick — promote the right build**
1. Vercel → project → **Deployments**.
2. Find the row with commit **"Add Join the Syndicate…"** (`332aee7`) or the newest cleanup commit.
3. **⋯ → Promote to Production.**

**B. Permanent — set the production branch (recommended)**
- Vercel → **Settings → Git → Production Branch** → set to **`feature/sicilia-rebuild`** → Save → redeploy.
- **Why:** `origin/main` is only the *initial commit*; ALL real work (15+ commits) is on
  `feature/sicilia-rebuild`. The domain was hand-pinned to one old build of it, so pushes
  never move the domain. Setting the production branch makes every push auto-deploy to the domain.
- **Cleaner long-term:** merge `feature/sicilia-rebuild` → `main` and deploy from `main`.

## Verify
`curl.exe -I https://younginvestors.co.za/join` should return **HTTP 200**.
Then on a phone: open `…/join` → **Download Now** → it installs to the home screen and
opens full-screen (standalone). iPhone/Safari shows *Share → Add to Home Screen*.

## PWA was already wired (no action needed)
- `frontend/app/manifest.ts` already generates `/manifest.webmanifest` (live, 200).
- `frontend/public/sw.js` already registered, production-only (live, 200).
- `frontend/public/icons/yi-icon-192.png` / `yi-icon-512.png` / `yi-maskable-512.png` already exist.
- I had added a static `public/manifest.webmanifest` — it **duplicated** `app/manifest.ts`
  (Next's generated route wins), so I **deleted it** in the cleanup commit. No behaviour change.
- Note: the installed app's `start_url` is `/login` (correct). `/join` is just the marketing/install
  splash; it is intentionally separate from the installed start page.

## Guardrails (unchanged)
- `MOCK_MVP_PAPER_TRADING_ONLY`. No secrets committed (`.env.local` is gitignored).
  `/join` adds no external calls.
- `public/audio/lounge.mp3` (Tadow, **19 MB**) is **NOT royalty-free** → replace before any
  public launch; also heavy on mobile data.
- `public/images/splash-side.png` (**2.3 MB**) is heavy → compress before wide testing.
