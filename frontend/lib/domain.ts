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
