import type { ConsensusResult, Money, VoteTally } from "@/lib/types";

export const CONSENSUS_THRESHOLD = 0.6;

/**
 * 60% Rule: the number of YES votes a Kitchen needs to pass a recipe.
 * Scales with kitchen size — ceil(60% × members):
 *   2 chefs → 2 YES  (100% — if you cook together, you both commit)
 *   3 chefs → 2 YES  (67%)
 *   4 chefs → 3 YES  (75%)
 *   5 chefs → 3 YES  (60%)
 *   6 chefs → 4 YES  (67%)
 *   8 chefs → 5 YES  (63%)
 *  10 chefs → 6 YES  (60%)
 * Kitchen size is the chef's choice. The 60% Rule scales with it.
 */
export function dynamicQuorum(totalMembers: number): number {
  return Math.ceil(CONSENSUS_THRESHOLD * Math.max(1, totalMembers));
}

export function calculateConsensus(votes: VoteTally): ConsensusResult {
  // A recipe passes when YES votes reach ceil(60% × kitchen size).
  // No requirement for everyone to vote — the table can cook as soon
  // as the threshold is hit, regardless of absent or abstaining chefs.
  const yesRequired = dynamicQuorum(votes.totalMembers);
  const yesRatio = votes.totalMembers === 0 ? 0 : votes.yes / votes.totalMembers;
  const quorumVotes = votes.yes + votes.no + votes.abstain;
  const quorumMet = votes.yes >= yesRequired;

  return {
    yesRatio,
    yesPercent: Math.round(yesRatio * 100),
    quorumVotes,
    quorumMet,
    thresholdMet: quorumMet,
    approved: quorumMet,
  };
}

/**
 * Chef's Say — a Hedge Kitchen's vote weight. Mutual Kitchens never call this;
 * every chef there counts as 1, by construction (the 60% Rule stays headcount-based).
 * Rank (Academy mastery) leads; kitchen_score (participation + seasoning discipline,
 * already tracked on profiles) can add at most +0.25 — an active Commis can close
 * the gap on an idle Master Chef, but rank still leads.
 */
const SAY_MULTIPLIER: Record<string, number> = {
  "Commis": 1.00,
  "Demi Chef": 1.15,
  "Chef de Partie": 1.30,
  "Sous Chef": 1.50,
  "Master Chef": 1.75,
};

export function sayMultiplier(rank: string): number {
  return SAY_MULTIPLIER[rank] ?? 1;
}

export function computeChefSay(rank: string, kitchenScore: number): number {
  const clampedScore = Math.max(0, Math.min(100, kitchenScore));
  return sayMultiplier(rank) + (clampedScore / 100) * 0.25;
}

export interface WeightedVoteTally {
  yesSay: number;
  totalSay: number;
}

/** Hedge Kitchen version of calculateConsensus: same 60% threshold, measured in
 * Chef's Say instead of headcount. Mutual Kitchens use calculateConsensus above. */
export function calculateWeightedConsensus(tally: WeightedVoteTally): ConsensusResult {
  const yesRatio = tally.totalSay === 0 ? 0 : tally.yesSay / tally.totalSay;
  const thresholdMet = yesRatio >= CONSENSUS_THRESHOLD;
  return {
    yesRatio,
    yesPercent: Math.round(yesRatio * 100),
    quorumVotes: tally.yesSay,
    quorumMet: thresholdMet,
    thresholdMet,
    approved: thresholdMet,
  };
}

export type ContributionKind = "deposit" | "withdrawal";
export type ContributionStatus = "requested" | "approved" | "rejected";

/**
 * A Kitchen Vault contribution is a joint-account paper intent (YI_UNIFIED_VISION.md
 * §3): it needs a co-signer who is not the requester, and can only move once it's
 * still "requested". A Personal Vault contribution has no co-signer requirement —
 * it's the chef's own paper capital — so this only governs Kitchen-level intents.
 */
export function canApproveContribution(
  requesterId: string,
  approverId: string,
  status: ContributionStatus
): boolean {
  return status === "requested" && requesterId !== approverId;
}

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: money.precision,
    maximumFractionDigits: money.precision,
  }).format(money.amount);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
