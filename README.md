# Young Investors (YI) Terminal v1.0.4
### Regulatory Sandbox MVP - Governance-First Investment Framework

## 1. Overview
Young Investors is a digitized governance terminal designed to formalize informal investment groups (Investment Kitchens) in South Africa. This MVP demonstrates a secure, transparent, and auditable workflow for group-based JSE asset management.

## 2. Compliance Architecture (The A+ Standard)
This project is built to satisfy the requirements of the **IFWG Regulatory Sandbox**:
* **FICA Integration:** Multi-step identity verification handshake.
* **Governance Engine:** 60% Quorum (3/5) logic enforced at the code level.
* **SARB Transparency:** Immutable Kitchen Ledger for all ZAR transactions.
* **Operational Safety:** Emergency "Circuit Breaker" to freeze trading during volatility.
* **Data Privacy:** POPIA-compliant consent frameworks and session termination.

## 3. Tech Stack
* **Framework:** Next.js 14+ (App Router)
* **Language:** TypeScript (Strict Mode)
* **Styling:** Tailwind CSS (Financial High-Contrast UI)
* **State Management:** React Hooks with persistent Session logic.

## 4. Getting Started
To audit the terminal locally:

```bash
# 1. Clone the repository
git clone [https://github.com/](https://github.com/)[your-username]/young-investors-mvp.git

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev
