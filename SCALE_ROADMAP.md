# Young Investors — Roadmap to 10,000 Users/Day

A detailed, phased plan to take the app from a **20–101 tester proof** to a system that
**reliably and sustainably serves ~10,000 daily active users (DAU)** with headroom for
launch spikes. Owners: **Claude** (builds code/config/tests/scripts/docs), **Carl**
(architecture + data/backend lane + reviews), **CEO** (provisioning, budget, legal,
go/no-go, and human ops ownership).

Hard boundary throughout: `MOCK_MVP_PAPER_TRADING_ONLY` — no real money/broker/bank/FICA,
not financial advice. Scaling must not quietly cross that line. See `SECURITY_GUARDRAILS.md`.

---

## 0. Success criteria (the definition of "done")
- **Availability:** ≥ 99.5% during launch week (≈ 50 min/month budget).
- **Latency:** p95 page interactive < 2.5 s; p95 API/RPC < 400 ms under peak.
- **Errors:** < 0.5% request error rate at peak.
- **Capacity proven:** a load test sustains **2–3× expected peak** without breaching the above.
- **Cost known:** $/1k-DAU modelled and approved before launch.
- **Compliant:** POPIA basics in place (SA personal data); terms + reward terms live.

## 1. What 10k DAU actually means (capacity math)
- **Peak concurrency** ≈ 5–15% of DAU → plan for **~1,000–1,500 concurrent**.
- **Request rate:** with good patterns, ~300–1,000 req/s at peak — **Supabase Pro +
  pooler + indexes handles this with headroom.** The danger is *self-inflicted* load:
  - The Kitchen **5-second vote-poll** and the **per-browser JSE fetch** multiply requests
    by users-on-screen. These must change before any load (see Phase 1).
- **Storage:** profile photos at 5 MB × 10k = ~50 GB — must be capped/compressed/deferred.
- **Bandwidth:** the **~19 MB audio** is a CDN bomb at scale — shrink + lazy + cache.

## 2. Target architecture (at 10k/day)
```
                 Vercel (Edge CDN + Next.js)          ── static + client, scales well
   Users ─────►  ├─ /api/market  (cached server proxy for JSE quotes, 1 fetch fans out)
                 ├─ /api/* edge functions (rate-limited)
                 └─ Supabase JS (anon key)
                         │
                 Supabase Pro
                 ├─ Postgres (+ pooler, indexes, RLS)   ── source of truth
                 ├─ Realtime  (vote/kitchen live updates, replaces polling)
                 ├─ Auth (GoTrue; confirm-email OFF or real SMTP)
                 └─ Storage (private bucket + signed URLs, compressed images)
   Observability: Supabase metrics + Vercel analytics + Sentry (errors) + uptime + alerts
   Email at scale: SendGrid (verification/notify) behind a queue/limits
   Abuse: Turnstile/hCaptcha on signup + rate limits
```
**Ceiling note:** Supabase Pro comfortably serves low-tens-of-thousands DAU. Beyond
~50–100k DAU or heavy server governance, migrate the write/governance path to the planned
**Azure Postgres + Django** (the preserved backend) — designed in Phase 4, not needed now.

## 3. Roadmap phases (gates between each — don't skip a gate)

**Phase 0 — Stabilise & provision (Days 1–2).**
- Finish known gaps (practice-attempt confirm, modal centring, `◆`→icon, scroll motion).
- CEO provisions: Supabase **Pro**, Vercel **Pro**, Sentry, uptime monitor, SendGrid,
  CAPTCHA account. Confirm `.env`/secrets correct; fail-closed guard verified.
- **Gate:** build green, all routes 200, plans live, secrets correct.

**Phase 1 — Harden the data + request layer (Week 1).** *Highest leverage.*
- Add **indexes** (Section 5). Audit **RLS** for correctness + cost.
- Enable the **connection pooler**; set sane client timeouts/retries.
- **Replace vote polling with Supabase Realtime**; only subscribe when on the floor.
- Build the **server-side cached JSE proxy** (`/api/market`); point the adapter at it.
- **Storage strategy:** private bucket + signed URLs, client-side image compression to
  ≤ 1 MB, or defer photo upload to post-launch.
- **Signup CAPTCHA + rate limiting**; basic abuse controls.
- **Shrink/lazy-load audio + code-split** heavy views (market, charts).
- **Gate:** code complete + Carl-reviewed; staging smoke green.

**Phase 2 — Observability + load test (Week 2).**
- Wire **Sentry**, **Vercel Analytics/Speed Insights**, **Supabase metrics + alerts**,
  uptime checks. Write **runbooks** (DB saturation, auth errors, storage full, rollback).
- **k6 load test** (Section 6) at 2–3× peak; profile slow queries; fix bottlenecks; re-test.
- **Gate:** load test meets the Section 0 SLOs.

**Phase 3 — Compliance + ramped launch (Week 3).**
- POPIA basics (Section 8) + terms + reward terms live + legal sign-off.
- **Waved launch:** 500 → 2,000 → 5,000 → 10,000, watching dashboards at each step;
  ability to pause/rollback. (Your existing wave model — keep using it.)
- **Gate:** each wave holds SLOs before opening the next.

**Phase 4 — Sustain & optimise (ongoing).**
- CI/CD with preview + automated checks; weekly capacity review; cost optimisation;
  content-authoring pipeline; design the Azure/Django migration trigger + plan.

## 4. Workstreams & ownership
| Workstream | Claude (builds) | Carl (owns/reviews) | CEO (provisions/decides) |
|---|---|---|---|
| DB indexes + RLS audit | SQL migration + RLS tests | Approves schema/policy | Runs migration in Supabase |
| Realtime (replace polling) | Refactor `KitchenView`/`profileStore` | Realtime config + review | — |
| Market data proxy | `/api/market` route + cache | Adapter productionisation | Quote source + any key (server-side) |
| Storage hardening | compression + signed-URL code | bucket policy | private bucket decision |
| Abuse controls | CAPTCHA + rate-limit wiring | review | CAPTCHA + WAF accounts |
| Observability | Sentry/analytics wiring + runbooks | alert thresholds | Sentry/uptime accounts |
| Load testing | k6 scripts + report | targets + sign-off | approve test window |
| Compliance | privacy/export/delete code + copy | review | POPIA officer, legal, terms |
| CI/CD + perf | pipeline config + code-split | review | repo/CI settings |
| Human ops/on-call | (cannot — AI) | runbook authoring | **assign a human on-call** |

## 5. Technical hardening backlog (detailed)
- **Indexes:** `kitchen_members(user_id)`, `kitchen_members(kitchen_id)`,
  `kitchen_votes(proposal_ticker, user_id, created_at desc)`, `academy_attempts(user_id)`,
  `profiles(member_number)` (unique exists), `referrals(referred_user)`. Verify the
  `kitchens` RLS `exists()` subquery uses the member index.
- **RLS:** confirm every table is own-rows; confirm SECURITY DEFINER RPCs re-check
  `auth.uid()`; never expose `service_role` client-side; review the public storage bucket.
- **Pooler:** use Supabase transaction pooler for serverless; cap client retries; idempotent writes.
- **Realtime:** subscribe to the kitchen's votes channel only while on the floor; debounce.
- **Market proxy:** one server fetch, cached 30–60 s, served to all; never 10k browsers hitting a provider.
- **Auth:** keep email-confirm OFF or move to SendGrid SMTP with rate limits; add CAPTCHA.
- **Storage:** compress to ≤ 1 MB client-side; private bucket + short-lived signed URLs.
- **Frontend perf:** code-split `JSEMarket`/charts; lazy audio; keep First Load JS in budget;
  respect `prefers-reduced-motion`.
- **Resfilience:** graceful fallbacks already strong — extend to "service busy, retry" states.

## 6. Load & chaos testing plan
- **Tool:** k6 (or Grafana Cloud k6). **Scenarios:** signup storm; browse Academy; open a
  lesson; form/join Kitchen + vote (Realtime); Shop/market browse.
- **Profiles:** ramp to 1.5k VUs sustained (≈ peak), then spike to 3k for 5 min.
- **Pass bar:** Section 0 SLOs hold; no error cliff; DB CPU < 70%; no connection exhaustion.
- **Chaos:** kill the market proxy (expect graceful "simulation" fallback); throttle DB
  (expect retries/soft errors, not white screens).

## 7. Observability, SRE & incident response
- **Dashboards:** Supabase (DB CPU, connections, slow queries), Vercel (traffic, function
  errors, p95), Sentry (error rate), uptime (external probe).
- **Alerts:** error rate > 1%, p95 > target, DB CPU > 75%, connections > 80%, storage > 80%.
- **Runbooks:** DB saturation, auth failure spike, storage full, bad deploy rollback,
  Supabase incident. **One-click rollback** via Vercel.
- **On-call:** a **named human** for launch week (AI cannot hold a pager).

## 8. Security, privacy & compliance (do NOT skip — SA law)
- **POPIA (mandatory at scale):** appoint an **Information Officer**, lawful basis +
  **consent** at signup, privacy policy, **data subject rights** (access/export/delete),
  **operator/DPA agreements** with Supabase + Vercel + SendGrid, breach-notification plan,
  data-minimisation (you already default to minimal). Note minors → Junior Academy needs
  **guardian consent by design** before it ships.
- **Financial-conduct boundary:** keep "educational simulation / not advice / no real
  money" airtight; legal review before ANY advice/real-money/reward-payout feature.
- **Reward terms:** publish real terms before promising "Founding 100" rewards, or soften.
- **Security:** secrets in a manager (not repo); rotate keys; anon-key-only client; WAF/rate
  limits; dependency + `npm audit` in CI.

## 9. Cost model (order-of-magnitude, confirm live)
- **Supabase Pro:** ~$25/mo base + usage (DB compute, storage, egress, Realtime msgs).
- **Vercel Pro:** ~$20/seat/mo + usage (bandwidth, function invocations).
- **Sentry / uptime / CAPTCHA / SendGrid:** ~$0–50/mo each at this scale.
- **Storage/egress:** dominated by images + audio — the reason to compress/lazy.
- **Action:** model $/1k-DAU after Phase 2 (real numbers from the load test) before launch.

## 10. Top risks & mitigations
1. **Polling/fan-out self-DDoS** → Realtime + server proxy (Phase 1). *Highest risk.*
2. **Supabase limits/throttle** → Pro + pooler + indexes + load test.
3. **Storage/egress blowout** → compress/lazy/defer.
4. **POPIA non-compliance** → Phase 3 legal gate (regulatory + reputational).
5. **No human ops** → assign on-call; runbooks; rollback.
6. **Cost surprise** → model before launch; alerts/budgets.
7. **Bot signups** → CAPTCHA + rate limits.

## 11. CEO action list — what YOU must do to capacitate the build
**Provision & pay (Phase 0):** Supabase **Pro**, Vercel **Pro**, **Sentry**, an **uptime
monitor**, **SendGrid** (email), a **CAPTCHA** (Cloudflare Turnstile/hCaptcha). Own the
secrets (a password/secrets manager).
**Decide:** launch date + wave sizes; budget ceiling; whether photo upload ships at launch;
quote data source for the market proxy.
**Legal/compliance:** appoint a **POPIA Information Officer**; get privacy policy + terms +
reward terms drafted and reviewed; sign DPAs with Supabase/Vercel/SendGrid.
**People:** assign **one human on-call** for launch week (non-negotiable); decide if you
need a contract DevOps/SRE for the launch.
**Process:** approve the **load-test window**; approve each **launch wave** go/no-go;
set up a **support channel** for early users.
**Inputs to us:** the live env values (in Vercel, not the repo), the quote endpoint URL,
and sign-off at each phase gate.

## 12. Migration ceiling (when Supabase isn't enough)
Trigger a move of the **write/governance path** to **Azure Postgres + the preserved Django
backend** when: sustained > ~50–100k DAU, heavy server-side governance/audit needs, or
real-money/compliance features arrive. Design in Phase 4; the seam already exists
(`NEXT_PUBLIC_API_BASE_URL`, Django preserved). Not required for 10k/day.

---

### TL;DR
Nothing is architecturally broken — this is the normal *tester-proof → launch* gap. The
real work is **Phase 1 (kill polling/fan-out + indexes + Realtime + proxy + storage)** and
**Phase 2 (observe + load-test to 2–3× peak)**, with **Phase 3 compliance + waved launch**.
~**2–4 focused weeks**. You unblock it by provisioning the Pro plans, owning legal/POPIA,
and putting a human on the pager.
