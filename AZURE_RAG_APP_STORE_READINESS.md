# Azure RAG and App Store Readiness

Date: 2026-07-01

This is the production-readiness path for connecting We Cook / Young Investors to the
Azure LlamaIndex RAG template without weakening the current tester architecture.
It should be read together with `SECURITY_GUARDRAILS.md` and `YI_UNIFIED_VISION.md`.

Current repo reality:

- Frontend: `frontend/`, Next.js 15, deployed through Vercel.
- Tester data/auth: Supabase, documented in `frontend/DEPLOY_VERCEL_SUPABASE.md`.
- Preserved backend: Django/DRF, documented in `DEPLOYMENT.md`, not active for the
  current tester stack.
- Installable app surface: PWA manifest in `frontend/app/manifest.ts` and service
  worker in `frontend/public/sw.js`.
- Finance boundary: `MOCK_MVP_PAPER_TRADING_ONLY`. Production-shaped Vault,
  ledger, escrow-state, and adapter concepts may exist, but no live money, broker,
  bank, PSP, wallet, FICA, real order routing, custody integration, or investment advice.

## CTO Decision

Use the Microsoft/Azure LlamaIndex JavaScript template as a separate Azure-hosted
Gordon RAG service, not as a replacement for the Vercel frontend.

Recommended shape:

```text
Users
  -> Vercel Next.js frontend at younginvestors.co.za
  -> Supabase Auth/Postgres/Storage for tester identity and app state
  -> Azure Container Apps service: gordon-rag
       -> Azure OpenAI / Azure AI Foundry model deployments
       -> Azure Key Vault for secrets
       -> Managed identity for Azure resource access
       -> Curated content index for Academy, Shop, glossary, risk explainers
```

Do not put Azure OpenAI keys, Supabase service-role keys, embeddings indexes, or raw
tester data in browser code.

## How To Use The Azure Template

The Azure sample is useful for:

- a serverless RAG service on Azure Container Apps;
- Bicep/`azd` infrastructure;
- Azure OpenAI chat and embeddings;
- file, website, and database ingestion patterns;
- a deployable Node/TypeScript reference.

Adapt it for We Cook by changing the domain:

1. Ingest only approved Young Investors content first:
   Academy lessons, Gordon glossary, Shop explainers, public docs, and compliance-safe
   FAQs.
2. Exclude private user records at launch:
   no emails, ages, profile pictures, Kitchen membership, votes, predictions, feedback,
   portfolio snapshots, or raw Supabase rows.
3. Add Supabase later through a backend-only connector:
   use a read-only Postgres role or a narrow RPC/view that exposes only approved
   content columns. Avoid using the Supabase `service_role` key unless there is a
   separate security review.
4. Keep all responses educational:
   Gordon can explain, critique, and tutor. Gordon must not recommend trades or imply
   live execution.
5. Keep retrieval explainable:
   responses should include source titles/ids and the retrieval mode, especially when
   discussing finance, governance, or risk.

## Azure Production Baseline

For the RAG service:

- Host as an Azure Container App named something like `gordon-rag`.
- Use managed identity for Azure resource access where supported.
- Store remaining secrets in Azure Key Vault and reference them from Container Apps.
- Keep Azure OpenAI credentials server-side only.
- Add Application Insights / Azure Monitor, with redaction rules for prompts and user
  identifiers.
- Add request rate limits and abuse controls before public launch.
- Keep an allowlist of frontend origins: `https://younginvestors.co.za` and
  `https://www.younginvestors.co.za`.
- Deploy with `azd` or CI after the CEO provisions Azure and approves the cost.

Do not deploy from this repo until the CEO approves:

- Azure subscription/resource group;
- model deployment names and region;
- monthly budget ceiling;
- Key Vault ownership;
- data sources allowed for ingestion;
- whether prompts and completions may be retained for debugging.

## Model Guidance

The pasted Azure template mentions `gpt-35-turbo` version `1106`. Treat that as a
template default, not a product decision. Model and region availability changes.

Before production, choose current Azure AI Foundry/Azure OpenAI deployments for:

- chat/reasoning;
- embeddings;
- optional moderation/safety classification.

Record the selected deployment names in Azure app settings or Key Vault, not in source.

## App Store Readiness

Azure helps with backend, AI, CI/CD, observability, and secrets. It does not by itself
make a web app App Store ready.

Current best path:

1. Keep the Vercel PWA as the fastest installable version.
   The repo already has a manifest and service worker. Finish PWA polish first.
2. For the Apple App Store, decide whether to wrap the app or rebuild native:
   Capacitor is the pragmatic path for the current Next.js app. React Native/Expo is a
   bigger rewrite and should wait until product-market proof is clearer.
3. Use Azure DevOps only for the native build/release lane if needed:
   macOS build agents, signing certificates, provisioning profiles, TestFlight, and
   App Store Connect integration.
4. Prepare App Review materials:
   privacy policy, terms, age rating, finance disclaimers, screenshots, support URL,
   account deletion pathway, and clear "educational simulation only" copy.

App Review blockers to remove before submission:

- copyrighted or uncleared audio/assets, including the current lounge audio warning in
  `DEPLOY_HANDOFF.md`;
- any copy that implies guaranteed returns, live trading, custody, broker execution, or
  investment advice;
- missing privacy policy, support contact, or account deletion path;
- collecting under-18 sensitive identity, banking, payment, broker, or real-finance data.

## Implementation Phases

Phase 0: Freeze the current tester lane

- Keep Vercel + Supabase as the active public tester stack.
- Keep Django/Azure backend off the active path unless separately approved.
- Verify `npm.cmd run build` and `npm.cmd run verify:supabase` before any public wave.

Phase 1: RAG prototype, no private data

- Fork or initialize the Azure LlamaIndex JavaScript template outside the active
  frontend path.
- Replace sample data with approved Academy/Shop/Gordon content.
- Add "not advice / educational simulation" system and response policies.
- Add tests for prompt-injection refusal and finance-boundary refusal.

Phase 2: Azure staging service

- Provision Azure Container Apps, Key Vault, Azure OpenAI, and monitoring.
- Use managed identity/Key Vault references for secrets.
- Set CORS to the Vercel production and preview origins only.
- Expose one server route, for example `POST /api/gordon/rag`, with authentication and
  rate limits.

Phase 3: Frontend integration

- Add a frontend adapter that calls the RAG service from server-side code or a trusted
  backend route. Do not call Azure OpenAI directly from the browser.
- Surface citations and confidence labels in Gordon UI.
- Keep fallback local explanations if the RAG service is unavailable.

Phase 4: App Store lane

- Complete PWA audit: manifest, icons, offline fallback, performance, asset licensing.
- Add account deletion/export request flow before wider production data collection.
- Choose Capacitor or a native rewrite.
- Set up Apple Developer Program, bundle ID, signing, TestFlight, and review metadata.

## Minimum Go/No-Go Checklist

Go only when all are true:

- Build is green.
- Supabase RLS remains enabled.
- No service-role key is in frontend/Vercel public env vars.
- Azure OpenAI calls happen only server-side.
- No private tester data is ingested into RAG.
- Finance mode remains `MOCK_MVP_PAPER_TRADING_ONLY`.
- RAG has rate limits, logging redaction, and failure fallback.
- App copy says educational simulation, no live execution, and not financial advice.
- Privacy policy, terms, and account deletion path exist before App Store submission.
- A human owns Azure/App Store credentials and launch-week incident response.

## Official References

- Azure Container Apps managed identity:
  https://learn.microsoft.com/en-us/azure/container-apps/managed-identity
- Azure Container Apps secrets and Key Vault references:
  https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets
- Azure Developer CLI CI/CD:
  https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/configure-devops-pipeline
- Azure OpenAI / Azure AI Foundry model catalog:
  https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/models
- Apple App Store extension for Azure DevOps:
  https://marketplace.visualstudio.com/items?itemName=ms-vsclient.app-store
