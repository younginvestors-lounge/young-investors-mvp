import type { ConsensusResult, Money, VoteTally } from "@/lib/types";

export const CONSENSUS_THRESHOLD = 0.6;

export function calculateConsensus(votes: VoteTally): ConsensusResult {
  const decisiveVotes = votes.yes + votes.no;
  const yesRatio = decisiveVotes === 0 ? 0 : votes.yes / decisiveVotes;
  const quorumVotes = votes.yes + votes.no + votes.abstain;
  const quorumMet = quorumVotes >= votes.quorumRequired;
  const thresholdMet = yesRatio >= CONSENSUS_THRESHOLD;

  return {
    yesRatio,
    yesPercent: Math.round(yesRatio * 100),
    quorumVotes,
    quorumMet,
    thresholdMet,
    approved: quorumMet && thresholdMet,
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
