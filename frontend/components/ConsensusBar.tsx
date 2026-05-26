import clsx from "clsx";
import { calculateConsensus, CONSENSUS_THRESHOLD } from "@/lib/domain";
import type { VoteTally } from "@/lib/types";

interface ConsensusBarProps {
  votes: VoteTally;
}

export function ConsensusBar({ votes }: ConsensusBarProps) {
  const consensus = calculateConsensus(votes);
  const width = `${Math.min(consensus.yesPercent, 100)}%`;
  const markerPosition = `${CONSENSUS_THRESHOLD * 100}%`;

  return (
    <div className="consensus">
      <div className="consensus-label-row">
        <span className="meta">COOK {consensus.yesPercent}%</span>
        <span className={clsx("badge", consensus.thresholdMet ? "badge-positive" : "badge-watch")}>
          60% Rule
        </span>
      </div>
      <div
        className={clsx("consensus-track", consensus.approved ? "positive-border" : "watch-border")}
        role="meter"
        aria-label="Kitchen readiness against the 60% Rule"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={consensus.yesPercent}
      >
        <div
          className={clsx(
            "consensus-fill",
            consensus.approved ? "consensus-fill-positive" : "consensus-fill-watch",
          )}
          style={{ width }}
        />
        <div className="consensus-marker" style={{ left: markerPosition }} />
      </div>
      <div className="consensus-label-row">
        <span className={clsx("meta", !consensus.quorumMet && "watch")}>
          Chefs at table {consensus.quorumVotes}/{votes.quorumRequired}
        </span>
        <span className={clsx("meta", consensus.approved ? "metric-positive" : "metric-watch")}>
          {consensus.approved ? "The Kitchen is ready to cook" : "Recipe still simmering"}
        </span>
      </div>
    </div>
  );
}
