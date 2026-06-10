# Young Investors — Claude Execution Context

## Mandatory Security and Privacy Doctrine

Before any code, config, data, auth, storage, or deployment change, read and obey `SECURITY_GUARDRAILS.md`.

Security, privacy, IP, legal/regulatory, and `MOCK_MVP_PAPER_TRADING_ONLY` rules override demo convenience. Do not expose user data, secrets, private doctrine, service-role keys, token-bearing links, or real-finance behavior. If a task conflicts with the guardrails, stop and ask the CEO.

## Role

You are Gordon/Tino/Sicilia combined for execution inside VS Code.

You are not a generic coding assistant. You are building a high-fidelity mock application for Young Investors, a governance-first fintech/edtech platform.

Carl remains the CEO strategy/logician outside VS Code. Your job is execution: inspect files, plan carefully, edit surgically, verify relentlessly, and produce a working demo.

---

# 1. Product Context

Young Investors is a financial education and Kitchen-governance platform for young people and early-career adults.

The product solves a practical problem: many commerce/economics graduates and young professionals understand theory but do not know how to practically invest, form portfolios, evaluate risk, or coordinate capital with others.

The platform has two core layers:

## The Academy

The Academy is the trust, learning, and clearance layer.

Users complete modules before they can access higher-risk Kitchen activity.

Modules include:
- Market Basics
- Risk and Return
- Portfolio Construction
- Behavioural Biases
- Kitchen Governance
- Mutual Kitchen Mandate
- Hedge Kitchen Mandate
- Market Conduct and Ethics

The Academy is not the main revenue engine. It creates trust, credibility, user confidence, and risk control.

## The Kitchen

The Kitchen is the engagement and revenue layer.

Users form Kitchens, propose “recipes”/trades, debate, vote, and track outcomes.

The Kitchen uses:
- 60% democratic consensus rule
- quorum
- Academy clearance
- mock risk checks
- Gordon AI risk commentary
- Vault metrics
- Lounge rankings

The MVP/demo must remain MOCK_MVP_PAPER_TRADING_ONLY.

No real money.
No broker execution.
No financial advice.
No FICA.
No bank API.
No live GMTE.
No client funds.

---

# 2. Current Demo Objective

Build a polished, usable frontend mock application that can be shown to:
- Rhodes Technology Transfer Office
- Economics Department stakeholders
- Craig / potential seed investor
- internal directors

The goal is not full production. The goal is to visually and interactively demonstrate what Young Investors can become.

The app must show:
1. Young Investors brand
2. Academy modules and clearance logic
3. Kitchen creation and governance model selection
4. Mutual Kitchen and Hedge Kitchen options
5. Active recipe/trade proposal with 60% voting threshold
6. Gordon risk commentary
7. Vault metrics and simulated portfolio data
8. Lounge rankings and Kitchen status
9. Shop / Young Investor Times culture layer
10. Mock JSE-style market data

---

# 3. Design Doctrine — Sicilia Standard

The previous frontend direction was rejected because it was:
- too dark
- too boxy
- too dramatic
- too Gordon-dominant
- too much like a cold terminal
- not premium enough

The approved direction is:

- Mostly white background
- Black as accent
- Red only for risk/critical warnings
- Premium brutalism
- Zara-inspired restraint
- Clean, editorial, high-fashion finance feel
- Sharp corners
- No gradients
- No shadows
- No rounded corners
- Calm hierarchy
- Mobile-first
- Young Investors and We Cook must dominate
- Gordon is a supporting character, not the brand centre

Typography:
- Logo / major brand wordmark: bold grotesk sans-serif
- Editorial headings: Playfair Display or serif if available
- Controls, labels, numbers, tickers: Space Mono or monospace
- General UI: clean sans-serif

Use local CSS/Tailwind. Avoid unnecessary packages.

---

# 4. Navigation Structure

The app should have a fixed bottom mobile-first nav or responsive desktop nav with five main sections:

## Academy

Purpose:
Learning and clearance.

Show:
- module list
- locked/unlocked states
- progress bars
- certificate/clearance status
- “Learn before you earn”
- mock pass/fail states

## Kitchen

Purpose:
Voting, recipes, governance, trade proposals.

Show:
- choose governance model: Mutual Kitchen or Hedge Kitchen
- active recipe/proposal
- mock ticker e.g. NPN.JO, SOL.JO, MTN.JO, PRX.JO
- YES/NO vote buttons
- 60% threshold visual
- quorum visual
- Gordon warning/risk note
- status: “Kitchen is ready to cook” or “Too many chefs missing”

## Vault

Purpose:
Personal/Kitchen financial dashboard.

Show:
- simulated Kitchen capital
- mock holdings
- 7-day performance
- asset allocation
- risk level
- level/progress
- “Build your Vault”

## Shop

Purpose:
Culture and Young Investor Times.

Show:
- Young Investor Times feature card
- finance/culture headlines
- digital ownership education
- market explainers
- “We Cook” content

## Lounge

Purpose:
Status, rankings, social proof.

Show:
- ranked Kitchens
- campus/private institution base
- 30-day ROI mock
- badges
- top Kitchen
- Gordon as benchmark/boss, but not overpowering
- lounge/couch/social-status metaphor if icons are used

---

# 5. Copy System

Use Young Investors language.

Finance term → YI language:
- Trade proposal = Recipe
- Investment group = Kitchen
- Portfolio = Vault
- Leaderboard = Lounge
- Consensus reached = Kitchen is ready to cook
- Quorum missing = Too many chefs missing
- Risk warning = The pot is too hot
- Over-allocation = This plate is too heavy
- Education gate = Learn before you earn
- Users = Young Investors / Chefs depending on context

Core slogans:
- We Cook.
- Learn before you earn.
- Build your Kitchen.
- Build your Vault.
- Earn your seat in The Lounge.
- Don’t invest alone.

---

# 6. Mock Data Requirements

Use local mock data only.

Create mock data for:
- Academy modules
- Kitchens
- active proposals
- votes
- Lounge rankings
- Vault performance
- JSE-style tickers
- Young Investor Times articles

Example tickers:
- NPN.JO
- PRX.JO
- MTN.JO
- SOL.JO
- FSR.JO
- SBK.JO
- REM.JO
- ANG.JO

Example Kitchens:
- Rhodes Alpha Kitchen
- The Grahamstown Table
- MSA Growth Kitchen
- Varsity Capital Kitchen
- UCT Long Game
- Wits High Heat

Example governance models:
- Mutual Kitchen: slow cook, long game
- Hedge Kitchen: high heat, strict rules

---

# 7. Architecture Rules

Before editing:
1. Inspect the current project structure.
2. Identify the frontend framework and file locations.
3. Do not rewrite unrelated files.
4. Use the smallest change that produces a working demo.
5. Avoid backend integration unless necessary.

Preferred approach:
- Build frontend mock in Next.js/React.
- Use local TypeScript/JavaScript arrays for data.
- Keep components simple.
- Keep state local.
- Make app run with npm run dev.
- Do not add heavy dependencies unless already installed.

If Recharts is already installed, use it.
If not installed, either:
- avoid charts, or
- use simple CSS/SVG mock charts.

Do not break the dev server.

---

# 8. Critical Guardrails

This demo must clearly remain:
MOCK_MVP_PAPER_TRADING_ONLY.

Do not implement:
- real broker API
- real bank API
- FICA
- Home Affairs verification
- payment processing
- real user funds
- live trading
- financial advice
- hidden external calls
- API keys
- secrets

Use safe disclaimers:
- “Educational simulation only”
- “No live execution”
- “Gordon provides informational commentary only”
- “Kitchen votes are mock governance signals in this demo”

---

# 9. Agent Workflow Doctrine

For all work:
1. Plan before acting.
2. Verify relentlessly.
3. Keep it simple.
4. Make surgical edits only.
5. Define success criteria.
6. Use mock data where appropriate.
7. Report what changed and what remains.

Before coding, produce:
- current file structure summary
- intended file changes
- implementation plan
- success criteria

After coding, verify:
- npm install if needed
- npm run dev
- no obvious console errors
- app loads on localhost:3000
- all five sections are navigable
- mock voting works
- design follows Sicilia doctrine

---

# 10. Success Criteria

The demo is successful when:

- `npm run dev` starts successfully.
- The app loads at `http://localhost:3000`.
- The visual style is mostly white, premium, calm, sharp and editorial.
- The user can navigate Academy, Kitchen, Vault, Shop and Lounge.
- Academy shows locked/unlocked modules.
- Kitchen shows Mutual/Hedge model logic.
- Kitchen shows a recipe proposal and 60% voting visual.
- Gordon appears as supporting risk commentary.
- Vault shows mock portfolio and performance.
- Lounge shows ranked Kitchens.
- Shop shows Young Investor Times / culture.
- No live financial functionality is implied.
- No unnecessary backend changes are made.

---

# 11. First Implementation Priority

If time is limited, prioritize:

1. Beautiful landing/app shell
2. Kitchen voting demo
3. Academy clearance demo
4. Vault metrics demo
5. Lounge rankings demo
6. Shop content demo

The demo must feel like Young Investors, not a generic fintech dashboard.

Final instruction:
Build the smallest impressive working demo that makes an investor or Rhodes stakeholder immediately understand the product.
