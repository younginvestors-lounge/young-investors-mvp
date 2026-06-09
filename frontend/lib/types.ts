export const EXECUTION_MODE = "MOCK_MVP_PAPER_TRADING_ONLY" as const;

export type ExecutionMode = typeof EXECUTION_MODE;

export type DashboardTab = "kitchen" | "academy" | "vault" | "shop" | "lounge";


export interface Money {
  amount: number;
  currency: "ZAR";
  precision: 2;
  mode: ExecutionMode;
}

export interface AcademyModule {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  locked: boolean;
  requiredForKitchen: boolean;
  estimatedMinutes: number;
}

export interface AcademyClearance {
  complete: boolean;
  requiredModuleIds: string[];
  passedModuleIds: string[];
  missingModuleIds: string[];
}

export interface VoteTally {
  yes: number;
  no: number;
  abstain: number;
  quorumRequired: number;
  totalMembers: number;
}

export interface ConsensusResult {
  yesRatio: number;
  yesPercent: number;
  quorumVotes: number;
  quorumMet: boolean;
  thresholdMet: boolean;
  approved: boolean;
}

export type GovernanceModel = "mutual" | "hedge";

export interface TradeProposal {
  id: string;
  kitchenName: string;
  symbol: string;
  assetName: string;
  proposedSide: "BUY" | "SELL";
  proposedUnits: number;
  paperNotional: Money;
  thesis: string;
  riskNote: string;
  votes: VoteTally;
  userVote: "YES" | "NO" | null;
  academyClearanceRequired: boolean;
  governanceModel: GovernanceModel;
}

export interface GordonMarketRead {
  stance: string;
  summary: string;
  riskScore: number;
  criticalAlerts: string[];
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  units: number;
  paperValue: Money;
  allocationPercent: number;
  roiPercent: number;
}

export interface EquityPoint {
  day: string;
  value: number;
}

export interface PortfolioSnapshot {
  totalSyndicateCapital: Money;
  holdings: PortfolioHolding[];
  roiPercent: number;
  sevenDayEquity: EquityPoint[];
  gordonMarketRead: GordonMarketRead;
}

export interface TimesFeature {
  kicker: string;
  title: string;
  deck: string;
  byline: string;
}

export interface MarketTicker {
  symbol: string;
  name: string;
  price: Money;
  changePercent: number;
  critical: boolean;
}

export interface MacroNewsCard {
  id: string;
  region: string;
  headline: string;
  summary: string;
  critical: boolean;
}

export interface EarnedBadge {
  id: string;
  name: string;
  description: string;
  category: "clearance" | "process" | "achievement";
}

export interface RankingRow {
  rank: number;
  name: string;
  institution: string;
  paperCapital: Money;
  roiPercent: number;
  isGordon: boolean;
  beatGordon?: boolean;
  earnedBadges?: EarnedBadge[];
}

export type ChefVote = "FOR" | "AGAINST" | "ABSTAIN" | null;

export interface KitchenMember {
  id: string;
  name: string;
  vote: ChefVote;
  isUser: boolean;
  profileIcon?: string;
  clearanceLevel?: string;
  recipesProposed?: number;
}

export interface DashboardSnapshot {
  academyClearance: AcademyClearance;
  academyModules: AcademyModule[];
  tradeProposals: TradeProposal[];
  portfolio: PortfolioSnapshot;
  timesFeature: TimesFeature;
  timesSecondary: TimesFeature[];
  marketTickers: MarketTicker[];
  macroNews: MacroNewsCard[];
  rankings: RankingRow[];
}
