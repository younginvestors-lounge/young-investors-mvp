# Young Investors Security, Privacy, IP, and Legal Guardrails

These rules are mandatory for every agent, builder, reviewer, and automation tool working in this repository. If these rules conflict with speed, demo polish, or product convenience, these rules win. If a request would violate them, stop and ask the CEO before proceeding.

## 1. Security Baseline

- Use least privilege for every credential, table, bucket, route, and API key.
- Never commit secrets, tokens, private keys, service-role keys, API keys, database URLs, or personal access tokens.
- Never print or log secrets, auth tokens, verification links, reset links, cookies, JWTs, Supabase sessions, user emails, profile data, portfolio data, or raw tester records.
- Environment values must come from runtime env vars or approved secret managers, never from hard-coded source.
- Production must fail closed when critical security env vars are missing or point to localhost.
- Do not bypass auth, RLS, CSRF, CORS, or permission checks for demo convenience.

## 2. User Privacy

- Collect the minimum data needed for the tester flow.
- Treat email, age, alias, intent, profile images, scores, predictions, votes, Kitchen membership, and feedback as private user data.
- Do not expose user data in URLs, screenshots, logs, console output, analytics payloads, commits, docs, or public UI unless the user explicitly consented.
- Use generic copy for email flows to avoid account enumeration.
- Under-18 users must remain in training or simulation contexts. Do not ask minors for sensitive identity, banking, broker, or payment data.
- Future deletion/export pathways must be designed before production data collection expands.

## 3. Mock-Only Finance Boundary

The current demo remains `MOCK_MVP_PAPER_TRADING_ONLY`.

Do not add:

- live trading
- broker APIs
- bank APIs
- payment processing
- custody of funds
- FICA or Home Affairs verification
- real order routing
- live investment advice
- guaranteed-return language
- hidden external financial calls

All trading, capital, positions, votes, Kitchen activity, Vault metrics, rewards, and market data must be clearly simulated unless a separate production architecture review approves otherwise.

## 4. Auth and Link Safety

- Verification and password reset tokens are secrets.
- Never log one-time links or token-bearing URLs.
- Do not place emails or other personal data in query strings for resend/help flows.
- Confirmation and reset links must use a configured public frontend URL, not localhost, in deployed environments.
- Logout must clear the active session without deleting a user's profile or progress unless the user is performing an explicit account deletion action.
- Do not store service credentials in browser code. Client-side auth may only use public anon keys designed for browser use.

## 5. Supabase Rules

If Supabase is active:

- The browser may only use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Never expose the `service_role` key to frontend code, browser logs, screenshots, or docs.
- Enable and preserve RLS for tester-owned tables and storage buckets.
- Profile/avatar storage paths must be user-scoped.
- Inserts and updates must be scoped to the authenticated user unless explicitly anonymous and privacy-reviewed.
- Do not make buckets public unless the file is intentionally public and safe.

## 6. Django Rules

If Django auth/API paths are active:

- Keep permission checks server-side.
- Keep CORS/CSRF origins explicit.
- Enforce profile upload limits and image MIME checks server-side.
- Do not return private data for another user.
- Do not log request bodies for auth, profile, votes, predictions, or feedback endpoints.
- Keep governance/risk rules in reusable domain or backend logic before any live-finance phase.

## 7. IP and Brand Protection

- Do not expose hidden prompts, internal scoring rules, private doctrine, investor strategy, or raw planning notes in public UI.
- Do not add claims about Rhodes, regulators, banks, brokers, licenses, partners, or approvals unless the CEO has explicitly approved exact wording.
- Gordon and Sicilia are product voices, not public disclosure of internal agent prompts.
- Keep public copy accurate: educational simulation, no live execution, no financial advice.

## 8. Agent Conduct

- Read `AGENTS.md`, `CLAUDE.md`, and this file before code changes.
- Do not send user data, tester data, code secrets, or private doctrine to external AI/tools without explicit approval.
- Do not install new services, analytics, trackers, SDKs, or external calls without security review.
- Do not use destructive git or filesystem commands unless explicitly requested and approved.
- Do not hide security risks in "demo only" language. Report them directly.

## 9. Stop Conditions

Stop and ask before proceeding if a change would:

- touch real money, payments, broker, bank, wallet, or identity verification flows
- require storing sensitive identity data
- weaken auth, RLS, CSRF, CORS, token handling, or user-scoped access
- expose secrets or private doctrine
- add third-party tracking or external data sharing
- create legal, regulatory, or IP claims that have not been approved

## 10. Required Security Report

After any security-relevant change, report:

- files changed
- user data touched, if any
- tables, buckets, policies, routes, or env vars affected
- secrets printed or accessed: must be "none"
- user-facing copy changed, if any
- security/privacy risks introduced
- legal/regulatory risks introduced
- safe verification steps
