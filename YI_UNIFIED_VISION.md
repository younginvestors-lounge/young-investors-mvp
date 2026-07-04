# Young Investors Unified Vision

Date: 2026-07-01

This is the canonical product, engineering, compliance, and agent-prompt vision for
Young Investors / We Cook. All repo prompts, product copy, backend models, frontend
flows, Azure/RAG work, and regulatory-readiness work should align to this document.

`SECURITY_GUARDRAILS.md` remains the highest authority for security, privacy, IP,
legal/regulatory, and mock-only finance boundaries.

## 1. Product Thesis

Young Investors is a governance-first fintech and financial education platform that
turns learning into disciplined collective market behaviour.

The product exists because young people do not only need market access. They need:

- financial literacy before exposure;
- peer accountability before execution;
- transparent governance before pooled action;
- risk coaching before confidence becomes overconfidence;
- behavioural evidence before a regulated product asks for real trust.

The brand promise is simple:

```text
We Cook.
Learn before you earn.
Do not invest alone.
```

## 2. The Star System

Every feature belongs to one of these surfaces:

- **Academy:** proves readiness before market participation.
- **Kitchen:** peer syndicates where members form, debate, and vote.
- **Arena:** proposal creation, discussion, voting, quorum, and the 60% Rule.
- **Vault:** the money-control and portfolio surface.
- **Shop:** culture, market intelligence, education, and narrative.
- **Lounge:** status, ranking, and social proof.
- **Gordon:** risk critic, tutor, behavioural coach, and benchmark.
- **Sicilia:** brand/purpose voice, emotional clarity, and cultural gravity.

The product is not just a trading sandbox. It is a behavioural finance evidence
engine.

## 3. Vault Meaning

The Vault is the unified money-control surface.

It has two views on the same Vault page:

- **Personal Vault:** the individual chef's personal balance, practice capital,
  receipts, education-linked readiness, and future personal account state.
- **Kitchen Vault:** the Kitchen's pooled vault, future joint escrow/trust-account
  view, mandate controls, voted allocations, receipts, and shared performance.

In the current tester build, both Vaults are:

```text
MOCK_MVP_PAPER_TRADING_ONLY
```

That means:

- no real deposits;
- no real withdrawals;
- no custody of client funds;
- no payment processing;
- no bank, broker, or wallet integration;
- no real execution;
- no investment advice.

The production-shaped implementation may include ledgers, mandates, contribution
intents, approval states, reconciliation states, audit records, and adapter
interfaces. Those must remain simulated until a separate live-money architecture
review approves a regulated integration.

The lean implementation rule is:

```text
Build the full product workflow.
Disable only real-money settlement.
```

So the frontend and backend may model production-grade behaviour such as personal
vaults, Kitchen vaults, contribution intents, escrow states, mandate approvals,
paper deposits, paper withdrawals, paper receipts, reconciliation states, and audit
logs. The only missing piece in the tester build must be actual movement of money
through a bank, PSP, broker, wallet, or escrow provider.

## 3.1 Terminal And Triple-Face Receipts

The Terminal is the public-accountability spine of We Cook. It is not merely an
activity feed. A receipt is a structured mock triple-ledger accounting statement
that can later be adapted to an append-only public repository or blockchain layer.

Every receipt has three faces:

- **Personal Chef receipt:** private, detailed, and recallable by the chef. It may
  include the chef's own reasoning, paper amount, decision context, timestamp, and
  private reflection.
- **Kitchen receipt:** visible to Kitchen members only. It contains the Kitchen and
  Vault subset needed for governance, reconciliation, accounting, and the 60% Rule,
  without exposing the chef's broader personal data outside the Kitchen context.
- **Public Ledger receipt:** visible publicly only after a five-minute reconciliation
  delay. It shows anonymised decision facts such as decision category, ticker,
  timestamp, and mock commitment. It must not disclose chef identity, Kitchen
  identity, personal reasoning, member rosters, private Vault data, or live-money
  settlement information.

The public ledger exists to create transparent behavioural-finance evidence and
market-conduct accountability while preserving POPIA-conscious privacy. During the
tester build, it remains:

```text
MOCK_MVP_PAPER_TRADING_ONLY
```

## 4. Regulated Future

The long-term target is a regulated product that can support real user cash, Kitchen
pooled capital, and payment services lawfully.

An FSP licence is part of the target path, but not the whole path. The full live-money
future may require:

- **FSCA / FAIS:** FSP licence, fit-and-proper, key individuals, representatives,
  compliance officer, operational ability, financial soundness, and conduct controls.
- **SARB / National Payment System:** payment-system participation or approved
  third-party payment-provider/bank arrangements.
- **Prudential Authority / Banks Act analysis:** clear structure so pooled funds are
  not illegal deposit-taking.
- **FIC / AML-CFT:** FIC registration where required, RMCP, CDD, beneficial ownership,
  sanctions screening, PEP checks, transaction monitoring, suspicious/unusual
  transaction reports, and record keeping.
- **POPIA:** Information Officer, lawful basis, consent, minimisation, impact
  assessment, data-subject rights, security safeguards, and breach process.
- **IFWG sandbox path:** controlled test plan, customer-risk restrictions, duration,
  reporting cadence, exit criteria, and no implied regulatory approval.

Until that architecture is approved, code must not contain live bank, PSP, broker,
wallet, FICA, or custody integrations. Escrow/joint-account concepts may appear as
typed simulated states and adapter interfaces only, clearly marked mock/paper.

## 5. Production-Shaped Mock Standard

The app should behave like the future regulated product, while remaining unfunded and
simulated.

That means we build:

- typed domain models;
- deterministic governance calculations;
- backend-ready service boundaries;
- clear API/database seams;
- adapter interfaces for future bank, escrow, broker, market-data, and RAG services;
- audit trails for proposals, votes, risk reviews, state transitions, and feedback;
- failure states and reconciliation concepts;
- compliance-friendly copy and records.

But every simulated money movement must be marked as:

```text
MOCK_MVP
MOCK_MVP_PAPER_TRADING_ONLY
```

Suggested gate names:

```text
EXECUTION_MODE = "MOCK_MVP_PAPER_TRADING_ONLY"
LIVE_MONEY_REVIEW_REQUIRED = true
```

## 6. Governance Flow

No Kitchen execution is an individual button press.

The canonical flow is:

1. Academy eligibility is checked.
2. A recipe/proposal is created.
3. The proposal carries thesis, ticker/asset, side, amount, and seasoning.
4. Kitchen members vote.
5. Quorum is evaluated.
6. The 60% Rule is evaluated in shared domain logic.
7. Gordon reviews risk, suitability, concentration, conduct, and behavioural signals.
8. Approved proposals become paper executions today.
9. Future live executions require regulated adapters, explicit consent, and audit.

## 7. Behavioural Evidence

Tester data should support research, regulatory sandboxing, product readiness, and
commercial readiness without over-collecting private data.

Collect evidence for:

- Academy completion and score improvement;
- lesson drop-off points;
- risk comprehension;
- vote reasoning quality;
- quorum and 60% outcomes;
- Gordon warning acknowledgement;
- Kitchen discipline and manipulation resistance;
- Vault clarity: whether chefs understand Personal Vault vs Kitchen Vault;
- trust and safety perception;
- complaints, confusion, and support issues;
- opt-in research feedback.

Do not collect banking, broker, payment, FICA, Home Affairs, sensitive identity, or
real-finance data in the tester build.

## 8. Product Voice

Young Investors is the brand. We Cook is the movement.

Gordon:

- critiques;
- explains;
- coaches;
- blocks unsafe shortcuts;
- never silently approves risky behaviour;
- never gives investment advice.

Sicilia:

- gives meaning;
- keeps the experience beautiful and emotionally legible;
- anchors the culture;
- reminds chefs why the discipline matters.

Copy must be accurate:

- educational simulation;
- paper trading only;
- no real money;
- no live execution;
- not financial advice;
- no guaranteed outcomes.

## 9. UI Standard

The Sicilia visual standard remains:

- mostly white;
- black as primary accent;
- red only for risk/critical/negative states;
- orange for caution/pending/watchlist states;
- green only for positive/approved/healthy states;
- sharp, premium, calm, editorial;
- no decorative metric colours;
- no copy that implies custody, guaranteed returns, advice, or live execution.

## 10. Engineering Standard

Build like a regulated product even when the current implementation is simulated:

- domain logic outside UI;
- pure functions for thresholds, financial math, risk scoring, and state transitions;
- typed interfaces for money, vaults, proposals, votes, risk reviews, and execution mode;
- API/database readiness;
- least-privilege data access;
- no secrets in client code;
- no logs of private user data, votes, portfolios, auth tokens, reset links, or feedback;
- tests around governance, eligibility, vault math, ledger transitions, and risk gates.

## 11. Prompt Hierarchy

When prompt documents conflict, apply this order:

1. `SECURITY_GUARDRAILS.md`
2. `YI_UNIFIED_VISION.md`
3. `AGENTS.md`
4. `CLAUDE.md`
5. `.github/copilot-instructions.md`
6. feature-specific docs and handoffs

The goal is one mind:

```text
Young Investors is a production-shaped, governance-first, research-aware,
regulated-future fintech platform that is currently operating as a clearly labelled
paper-trading tester build.
```

## 12. Official Reference Anchors

- FSCA FAIS fit-and-proper requirements:
  https://www.fsca.co.za/LR-FAIS-Fit-and-Proper/
- FSCA FAIS new applications:
  https://www.fsca.co.za/LR-FAIS-New-Applications/
- SARB payments and settlements:
  https://www.resbank.co.za/en/home/what-we-do/payments-and-settlements
- SARB illegal deposit-taking:
  https://www.resbank.co.za/en/home/what-we-do/Prudentialregulation/illegal-deposit-taking
- FIC compliance obligations:
  https://www.fic.gov.za/compliance/
- Information Regulator POPIA:
  https://inforegulator.org.za/popia/
- IFWG regulatory sandbox:
  https://www.ifwg.co.za/Pages/IFWG_Regulatory_Sandbox.aspx
