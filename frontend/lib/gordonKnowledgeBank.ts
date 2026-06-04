/**
 * Gordon's knowledge bank.
 *
 * Gordon is treated as a learner/operator: new knowledge is added as memory,
 * mapped to Gordon's Glossary, then filtered through his product role before it
 * reaches a chef. He can coach, critique, explain, and grade. He cannot advise,
 * execute, or pretend simulated data is verified market history.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY - educational memory, never financial advice.
 */

import {
  glossaryForHeatCheck,
  glossaryForKeys,
  glossaryKeysForHeatCheck,
  SHOP_STOCK_HEAT_CHECK_CONCEPTS,
  type GlossaryEntry,
  type GordonHeatCheckConcept,
} from "./gordonGlossary";
import {
  GORDON_JSE_TOP_40_HISTORY_MEMORY,
  JSE_TOP_40_HISTORY_MISSING_UNTIL_DATA_ADAPTER,
  JSE_TOP_40_HISTORY_REQUIRED_INPUTS,
  JSE_TOP_40_HISTORY_MEMORY_SCOPE,
  type GordonCompanyHistoryMemory,
} from "./jseMarket";

export type GordonMemoryDomain =
  | "market-history"
  | "microcredential-syllabus"
  | "risk-process"
  | "kitchen-governance";

export type GordonMemoryStatus =
  | "seeded"
  | "requires-licensed-data-adapter"
  | "verified";

export interface GordonLearnerOperatorFilter {
  role: "learner_operator";
  personalityTraits: string[];
  operatorDuties: string[];
  outputRules: string[];
}

export interface GordonKnowledgeMemory {
  id: string;
  title: string;
  domain: GordonMemoryDomain;
  status: GordonMemoryStatus;
  executionMode: "MOCK_MVP_PAPER_TRADING_ONLY";
  summary: string;
  glossaryConcepts: GordonHeatCheckConcept[];
  glossaryKeys: string[];
  syllabusHooks: string[];
  operatorUseCases: string[];
  dataRequirements: string[];
  safetyBoundaries: string[];
  relatedCompanyHistory?: GordonCompanyHistoryMemory[];
}

export const GORDON_LEARNER_OPERATOR_FILTER: GordonLearnerOperatorFilter = {
  role: "learner_operator",
  personalityTraits: [
    "direct",
    "disciplined",
    "protective",
    "plain-spoken",
    "process-first",
    "risk-aware",
  ],
  operatorDuties: [
    "translate market history into Gordon Glossary language",
    "separate reason from hunch before any Kitchen recipe is trusted",
    "flag heat, drawdown, volatility, and data-confidence limits",
    "prepare microcredential lessons from repeatable concepts",
    "keep every market output educational and paper-only",
  ],
  outputRules: [
    "never give financial advice or a buy/sell command",
    "never imply real execution, custody, broker access, or live trading",
    "never hide low-confidence or simulated data behind confident language",
    "always connect market movement to a glossary concept and a stated reason",
  ],
};

export const GORDON_JSE_TOP_40_CONSTITUENT_HISTORY_MEMORY: GordonKnowledgeMemory = {
  id: "gordon-jse-top-40-constituent-history",
  title: "JSE Top 40 Constituent Company History",
  domain: "market-history",
  status: "requires-licensed-data-adapter",
  executionMode: "MOCK_MVP_PAPER_TRADING_ONLY",
  summary: JSE_TOP_40_HISTORY_MEMORY_SCOPE,
  glossaryConcepts: SHOP_STOCK_HEAT_CHECK_CONCEPTS,
  glossaryKeys: glossaryKeysForHeatCheck(SHOP_STOCK_HEAT_CHECK_CONCEPTS),
  syllabusHooks: [
    "markets-001",
    "risk-001",
    "portfolio-001",
    "bias-001",
    "governance-001",
    "hedge-001",
  ],
  operatorUseCases: [
    "Shop stock-selection heat check",
    "Academy market-history examples",
    "Kitchen recipe seasoning review",
    "Vault post-trade performance explanation",
    "microcredential assessment prompts",
  ],
  dataRequirements: JSE_TOP_40_HISTORY_REQUIRED_INPUTS,
  safetyBoundaries: [
    "label current values as simulated until a licensed adapter is connected",
    "show data confidence beside every historical claim",
    "cite public context sources before naming a shock as the reason for a move",
    "use Gordon as critic and teacher, not as an investment adviser",
  ],
  relatedCompanyHistory: GORDON_JSE_TOP_40_HISTORY_MEMORY,
};

export const GORDON_KNOWLEDGE_BANK: GordonKnowledgeMemory[] = [
  GORDON_JSE_TOP_40_CONSTITUENT_HISTORY_MEMORY,
];

export const GORDON_JSE_TOP_40_HISTORY_MEMORY_BY_SYMBOL = Object.fromEntries(
  GORDON_JSE_TOP_40_HISTORY_MEMORY.map((memory) => [memory.symbol, memory])
) as Record<string, GordonCompanyHistoryMemory>;

export function glossaryForMemory(memory: GordonKnowledgeMemory): GlossaryEntry[] {
  return glossaryForKeys(memory.glossaryKeys);
}

export function glossaryForJseTop40History(): GlossaryEntry[] {
  return glossaryForHeatCheck(SHOP_STOCK_HEAT_CHECK_CONCEPTS);
}

export function gordonMemoryStatusLine(memory: GordonKnowledgeMemory): string {
  if (memory.status === "verified") {
    return "Verified memory: Gordon can explain this with sourced historical confidence.";
  }

  if (memory.status === "requires-licensed-data-adapter") {
    return `Seeded memory, not fully verified: Gordon needs ${JSE_TOP_40_HISTORY_MISSING_UNTIL_DATA_ADAPTER.join(", ")}.`;
  }

  return "Seeded memory: Gordon can teach the concept, but must label the data source and confidence.";
}

export type GordonChefReasonSource = "kitchen" | "academy" | "shop" | "vault";
export type GordonChefReasonAction =
  | "recipe-proposal"
  | "recipe-vote"
  | "prediction"
  | "reflection";

export interface GordonChefReasonInput {
  source: GordonChefReasonSource;
  action: GordonChefReasonAction;
  reason: string;
  ticker?: string;
  assetName?: string;
  side?: "BUY" | "SELL";
  units?: number;
  vote?: string;
}

export interface GordonChefReasonMemory extends GordonChefReasonInput {
  id: string;
  chefId: string;
  createdAt: string;
  wordCount: number;
  glossaryKeys: string[];
  glossaryConcepts: GordonHeatCheckConcept[];
  privacy: "local-demo-chef-memory";
}

export interface GordonScorecardProfile {
  id: string;
  rank: string;
  academy_score: number;
  jse_market_score: number;
  risk_return_score: number;
  kitchen_score: number;
  personal_prediction_score: number;
  kitchen_prediction_score: number;
  credential_status: string;
  attempts_used: number;
}

export interface GordonScorecardModule {
  id: string;
  title: string;
  passed: boolean;
  locked: boolean;
  requiredForKitchen: boolean;
}

export type GordonConceptStatus = "strong" | "polish" | "gap";

export interface GordonChefConceptReview {
  id: string;
  area: string;
  score: number;
  status: GordonConceptStatus;
  evidence: string;
  nextAction: string;
  glossaryKeys: string[];
}

export interface GordonChefScorecard {
  chefId: string;
  overallScore: number;
  rank: string;
  status: string;
  strengths: GordonChefConceptReview[];
  polishing: GordonChefConceptReview[];
  gaps: GordonChefConceptReview[];
  recentReasons: GordonChefReasonMemory[];
  rememberedReasonCount: number;
  gordonLine: string;
  privacyLine: string;
}

interface ScorecardAreaTemplate {
  id: string;
  area: string;
  moduleId?: string;
  glossaryKeys: string[];
  profileScore: (profile: GordonScorecardProfile) => number;
  strongAction: string;
  polishAction: string;
  gapAction: string;
}

const GORDON_CHEF_MEMORY_PREFIX = "yi_gordon_chef_memory";
const MAX_REASON_LENGTH = 800;
const MAX_REASONS_PER_CHEF = 40;

const SCORECARD_AREAS: ScorecardAreaTemplate[] = [
  {
    id: "market-context",
    area: "Market context",
    moduleId: "markets-001",
    glossaryKeys: ["stock", "index", "open-price", "close-price", "trend", "news-catalyst"],
    profileScore: (profile) => profile.jse_market_score,
    strongAction: "Keep connecting company stories to market context before the Kitchen votes.",
    polishAction: "Use the Shop heat check to name the index, trend, and catalyst more clearly.",
    gapAction: "Revisit Market Basics and name what moved the price before proposing a recipe.",
  },
  {
    id: "risk-return",
    area: "Risk and return",
    moduleId: "risk-001",
    glossaryKeys: ["risk", "return", "position-size", "drawdown", "volatility"],
    profileScore: (profile) => profile.risk_return_score,
    strongAction: "Keep sizing every recipe so one wrong call cannot end the night.",
    polishAction: "Add position size, drawdown, or volatility to your reason more consistently.",
    gapAction: "Clear Risk and Return before touching high-heat recipes.",
  },
  {
    id: "portfolio-construction",
    area: "Portfolio construction",
    moduleId: "portfolio-001",
    glossaryKeys: ["portfolio", "diversification", "asset-allocation", "correlation"],
    profileScore: (profile) => profile.kitchen_score,
    strongAction: "Keep checking plate weight before adding another holding.",
    polishAction: "Explain how the recipe changes the whole Vault, not just the single stock.",
    gapAction: "Study diversification and allocation before building heavier plates.",
  },
  {
    id: "governance",
    area: "Kitchen governance",
    moduleId: "governance-001",
    glossaryKeys: ["consensus-60", "quorum", "mutual-kitchen", "hedge-kitchen"],
    profileScore: (profile) => profile.kitchen_score,
    strongAction: "Keep making the table read the reason before voting.",
    polishAction: "Name quorum, the 60% Rule, and mandate fit when the vote is close.",
    gapAction: "Review Kitchen Governance so voting feels like process, not vibes.",
  },
  {
    id: "behaviour",
    area: "Behavioural discipline",
    moduleId: "bias-001",
    glossaryKeys: ["behavioural-bias", "anchoring", "herding", "market-conduct"],
    profileScore: (profile) => Math.round((profile.personal_prediction_score + profile.kitchen_prediction_score) / 2),
    strongAction: "Keep naming bias before it names you.",
    polishAction: "Separate repeatable reasons from hunches and crowd noise.",
    gapAction: "Take Behavioural Biases before trusting fast confidence.",
  },
  {
    id: "ethics",
    area: "Market conduct",
    moduleId: "ethics-001",
    glossaryKeys: ["market-conduct", "insider-trading", "data-confidence"],
    profileScore: (profile) => profile.academy_score,
    strongAction: "Keep the kitchen clean: public information, clear sources, no shortcuts.",
    polishAction: "Mention source confidence when your reason depends on news or rumours.",
    gapAction: "Review Market Conduct before using any information edge.",
  },
];

function chefMemoryKey(chefId: string): string {
  return `${GORDON_CHEF_MEMORY_PREFIX}:${chefId}`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function cleanReason(reason: string): string {
  return reason.trim().replace(/\s+/g, " ").slice(0, MAX_REASON_LENGTH);
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function conceptStatus(score: number): GordonConceptStatus {
  if (score >= 75) return "strong";
  if (score >= 50) return "polish";
  return "gap";
}

function classifyReason(reason: string): { glossaryKeys: string[]; glossaryConcepts: GordonHeatCheckConcept[] } {
  const lower = reason.toLowerCase();
  const keys = new Set<string>(["stock", "risk", "heat-check"]);
  const concepts = new Set<GordonHeatCheckConcept>(["selected-stock", "heat-check"]);

  if (/(open|close|gap|candle|chart|trend|moving|support|resistance)/.test(lower)) {
    ["open-price", "close-price", "price-gap", "trend", "volatility"].forEach((key) => keys.add(key));
    (["opening-price", "closing-price", "price-gap", "trend-analysis"] as GordonHeatCheckConcept[]).forEach((concept) => concepts.add(concept));
  }

  if (/(news|sens|earnings|results|rates|inflation|commodity|load-shedding|regulation|catalyst|shock)/.test(lower)) {
    ["news-catalyst", "market-shock", "data-confidence"].forEach((key) => keys.add(key));
    (["news-context", "market-shock", "data-confidence"] as GordonHeatCheckConcept[]).forEach((concept) => concepts.add(concept));
  }

  if (/(discount|valuation|return|profit|dividend|cash flow|margin|growth|price)/.test(lower)) {
    ["return", "dividend", "benchmark"].forEach((key) => keys.add(key));
    concepts.add("closing-price");
  }

  if (/(portfolio|allocation|diversif|correlation|sector|weight|plate|position|size)/.test(lower)) {
    ["portfolio", "asset-allocation", "diversification", "correlation", "position-size"].forEach((key) => keys.add(key));
    concepts.add("selected-stock");
  }

  if (/(quorum|vote|60|consensus|kitchen|mandate|mutual|hedge)/.test(lower)) {
    ["consensus-60", "quorum", "mutual-kitchen", "hedge-kitchen"].forEach((key) => keys.add(key));
  }

  if (/(hunch|vibe|twitter|tiktok|everyone|fomo|panic|fear|greed|anchor|herd)/.test(lower)) {
    ["behavioural-bias", "anchoring", "herding"].forEach((key) => keys.add(key));
  }

  return {
    glossaryKeys: Array.from(keys),
    glossaryConcepts: Array.from(concepts),
  };
}

export function readGordonChefReasons(chefId: string): GordonChefReasonMemory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(chefMemoryKey(chefId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GordonChefReasonMemory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGordonChefReasons(chefId: string, reasons: GordonChefReasonMemory[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(chefMemoryKey(chefId), JSON.stringify(reasons.slice(0, MAX_REASONS_PER_CHEF)));
  } catch {
    /* local privacy mode or quota - non-fatal */
  }
}

export function rememberGordonChefReason(
  chefId: string,
  input: GordonChefReasonInput
): GordonChefReasonMemory | null {
  const reason = cleanReason(input.reason);
  if (!chefId || !reason) return null;

  const classified = classifyReason(reason);
  const memory: GordonChefReasonMemory = {
    ...input,
    reason,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    chefId,
    createdAt: new Date().toISOString(),
    wordCount: countWords(reason),
    glossaryKeys: classified.glossaryKeys,
    glossaryConcepts: classified.glossaryConcepts,
    privacy: "local-demo-chef-memory",
  };

  writeGordonChefReasons(chefId, [memory, ...readGordonChefReasons(chefId)]);
  return memory;
}

export function clearGordonChefMemory(chefId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(chefMemoryKey(chefId));
  } catch {
    /* non-fatal */
  }
}

function scoreArea(
  template: ScorecardAreaTemplate,
  profile: GordonScorecardProfile,
  modules: GordonScorecardModule[],
  reasons: GordonChefReasonMemory[]
): GordonChefConceptReview {
  const lessonModule = template.moduleId ? modules.find((item) => item.id === template.moduleId) : undefined;
  const moduleScore = lessonModule?.passed ? 80 : lessonModule?.locked ? 20 : lessonModule ? 45 : 40;
  const storedScore = template.profileScore(profile);
  const reasonHits = reasons.filter((reason) =>
    reason.glossaryKeys.some((key) => template.glossaryKeys.includes(key))
  ).length;
  const score = clampScore((storedScore > 0 ? moduleScore * 0.55 + storedScore * 0.45 : moduleScore) + Math.min(12, reasonHits * 4));
  const status = conceptStatus(score);
  const evidence = lessonModule?.passed
    ? `${lessonModule.title} passed. ${reasonHits} remembered reason${reasonHits === 1 ? "" : "s"} matched this area.`
    : lessonModule?.locked
      ? `${lessonModule.title} is still locked. Gordon has limited evidence here.`
      : lessonModule
        ? `${lessonModule.title} is open but not passed. ${reasonHits} remembered reason${reasonHits === 1 ? "" : "s"} matched this area.`
        : `Gordon has ${reasonHits} remembered reason${reasonHits === 1 ? "" : "s"} for this area.`;

  return {
    id: template.id,
    area: template.area,
    score,
    status,
    evidence,
    nextAction: status === "strong" ? template.strongAction : status === "polish" ? template.polishAction : template.gapAction,
    glossaryKeys: template.glossaryKeys,
  };
}

export function buildGordonChefScorecard(
  profile: GordonScorecardProfile,
  modules: GordonScorecardModule[],
  reasons = readGordonChefReasons(profile.id)
): GordonChefScorecard {
  const reviews = SCORECARD_AREAS.map((template) => scoreArea(template, profile, modules, reasons));
  const overallScore = clampScore(
    reviews.reduce((sum, review) => sum + review.score, 0) / Math.max(1, reviews.length)
  );
  const strengths = reviews.filter((review) => review.status === "strong");
  const polishing = reviews.filter((review) => review.status === "polish");
  const gaps = reviews.filter((review) => review.status === "gap");
  const recentReasons = reasons.slice(0, 3);
  const gordonLine =
    gaps.length > 0
      ? `I measure your strengths and gaps. ${gaps[0].area} is Junior right now - polish it before the heat goes up.`
      : polishing.length > 0
        ? `${polishing[0].area} is Intermediate - close to clean. Prove the reason and the table will trust the recipe faster.`
        : "Master shape across the board. Keep proving the reason before chasing the result.";

  return {
    chefId: profile.id,
    overallScore,
    rank: profile.rank,
    status: profile.credential_status,
    strengths,
    polishing,
    gaps,
    recentReasons,
    rememberedReasonCount: reasons.length,
    gordonLine,
    privacyLine: "Stored locally in this demo as Gordon chef memory. No external API call. No real-money execution.",
  };
}

export function glossaryForChefScorecard(scorecard: GordonChefScorecard): GlossaryEntry[] {
  return glossaryForKeys([
    ...scorecard.strengths.flatMap((review) => review.glossaryKeys),
    ...scorecard.polishing.flatMap((review) => review.glossaryKeys),
    ...scorecard.gaps.flatMap((review) => review.glossaryKeys),
    ...scorecard.recentReasons.flatMap((reason) => reason.glossaryKeys),
  ]);
}
