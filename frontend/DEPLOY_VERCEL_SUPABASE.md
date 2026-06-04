# Deploy — Vercel (frontend) + Supabase (data)

Tester architecture for `younginvestors.co.za`: the Next.js frontend on **Vercel**,
data/auth/storage on **Supabase**. The Django backend stays in the repo for future
production and is **not deployed now**.

> `MOCK_MVP_PAPER_TRADING_ONLY` — no real money, brokers, banks, FICA, or payments.

Do Supabase first → see [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

---

## 1. Push to GitHub
Commit the repo and push (no secrets — `.env.local` is gitignored).

## 2. Import into Vercel
1. <https://vercel.com> → **Add New… → Project** → import the GitHub repo.
2. **Root Directory: `frontend`** (important — the Next app lives there).
3. Framework preset: **Next.js** (auto-detected). Leave build/output defaults.

## 3. Environment variables (Vercel → Settings → Environment Variables)
Set for **Production** (and Preview if you want preview deploys to work):
```
NEXT_PUBLIC_SUPABASE_URL        = https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = <your anon public key>
NEXT_PUBLIC_SITE_URL            = https://younginvestors.co.za
```
- **anon key only** — never the `service_role` key.
- Do **not** set `NEXT_PUBLIC_API_BASE_URL` (Django is not deployed for the test).

## 4. Add the domain (Vercel → Settings → Domains)
Add both:
- `younginvestors.co.za`
- `www.younginvestors.co.za`

Vercel will show the exact DNS targets to use in the next step.

## 5. Configure DNS at RegisterDomain
Using the values Vercel shows:
- **A record** — host `@` → Vercel's apex IP (e.g. `76.76.21.21`, use what Vercel displays).
- **CNAME** — host `www` → Vercel's target (e.g. `cname.vercel-dns.com`).

> Do **not** create `api.younginvestors.co.za` yet — that subdomain is reserved
> for the future Azure Django backend.

Wait for DNS to propagate and for Vercel to issue SSL (usually minutes).

## 6. Point Supabase auth at the live domain
In Supabase **Authentication → URL Configuration**, ensure the production URLs are
present (see [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) step 6):
- Site URL: `https://younginvestors.co.za`
- Redirect URLs include both apex + `www`.

## 7. Redeploy & test
1. Trigger a redeploy in Vercel (or push a commit).
2. Visit `https://younginvestors.co.za`:
   - `/` → `/login` splash.
   - `/onboarding` → creates an account → `/kitchen`.
   - `/signin` works for a returning chef.
   - `/profile` shows scores; photo upload works.
   - Academy **Submit Practice Attempt** persists; Kitchen vote persists.

## 8. Confirm no secrets are committed
- `.env.local` is gitignored (root `.gitignore` already covers `frontend/.env*.local`).
- Only `NEXT_PUBLIC_*` (anon) values are in the client. No `service_role` anywhere.

---

## Notes
- **Capacity:** no signup cap — comfortably supports the 30–101 tester target.
  Chef numbers are assigned from **2** (Gordon = 0, Sicilia = 1).
- **Graceful fallback:** if the Supabase env vars are missing, the app runs in a
  clearly labelled **Local demo** (localStorage) mode instead of breaking.

## Future architecture (after the tester proof)
```
Vercel frontend  →  api.younginvestors.co.za  →  Azure Django + Azure PostgreSQL
```
At that point: deploy Django to Azure App Service, set `NEXT_PUBLIC_API_BASE_URL`
in Vercel, create the `api` subdomain, and migrate governance server-side. None of
that is done now — this file covers the Supabase tester stack only.
