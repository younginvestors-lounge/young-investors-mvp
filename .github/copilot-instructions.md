# Young Investors Copilot Instructions

Build this repo as Young Investors, a non-custodial fintech MVP for education-led peer investment Kitchens.

Core product surfaces:
- Academy: eligibility and clearance before trading participation.
- Kitchen: peer syndicates, roles, member status, and pooled micro-capital simulation.
- Arena: trade proposals, discussion, voting, and the 60% Rule.
- Vault: portfolio tracking, positions, and performance analytics.
- Shop: cultural and market-intelligence hub.
- Lounge: Kitchen leaderboard with Gordon as benchmark.
- Gordon: AI/quant risk critic, tutor, and behavioral intelligence layer.

Non-negotiable constraints:
- Do not imply Young Investors directly holds client money unless code is explicitly marked `MOCK_MVP`.
- Label simulated execution clearly with `MOCK_MVP_PAPER_TRADING`.
- Keep the 60% Rule in reusable domain logic, not only UI components.
- Gate execution behind Academy clearance, Kitchen governance, vote threshold checks, and Gordon risk review.
- Keep mock data isolated behind interfaces that can later be replaced with APIs, database persistence, broker adapters, wallet integrations, or market-data providers.
- Avoid UI copy or data models that imply guaranteed returns, investment advice, custody, or real order routing.

Engineering standards:
- Prefer TypeScript types, deterministic pure functions, and clear domain models.
- Separate business logic from presentation.
- Do not hard-code critical financial rules inside React components.
- Add focused tests when changing eligibility, voting, execution state, portfolio math, or risk scoring.
- Treat auditability, privacy, and compliance readiness as first-class design concerns.

Tailwind metric color semantics:
- Green means positive: gains, approvals, successful performance, or healthy risk signals.
- Orange means neutral: pending, cautionary, watchlist, or informational metrics.
- Red means negative: losses, failed checks, rejected states, or high-risk signals.
- Do not use green, orange, or red decoratively on financial, governance, or risk metrics.
