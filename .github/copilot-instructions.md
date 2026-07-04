# Young Investors Copilot Instructions

Read `SECURITY_GUARDRAILS.md` first. Then use `YI_UNIFIED_VISION.md` as the canonical product and prompt north star for Young Investors / We Cook.

Build this repo as Young Investors, a production-shaped, paper-only fintech tester build for education-led peer investment Kitchens. The regulated future includes Personal Vaults and Kitchen Vaults, but live money is disabled until a reviewed approval path exists.

Core product surfaces:
- Academy: eligibility and clearance before trading participation.
- Kitchen: peer syndicates, roles, member status, and pooled micro-capital simulation.
- Arena: trade proposals, discussion, voting, and the 60% Rule.
- Vault: Personal Vault and Kitchen Vault, portfolio tracking, positions, ledger states, receipts, and performance analytics.
- Shop: cultural and market-intelligence hub.
- Lounge: Kitchen leaderboard with Gordon as benchmark.
- Gordon: AI/quant risk critic, tutor, and behavioral intelligence layer.

Non-negotiable constraints:
- Do not imply Young Investors currently holds client money unless code is explicitly marked `MOCK_MVP`.
- Label simulated execution and simulated Vault money movement clearly with `MOCK_MVP_PAPER_TRADING_ONLY`.
- Model escrow, payment, contribution, withdrawal, and reconciliation concepts as paper-only states or adapter seams until live-money approval exists.
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
