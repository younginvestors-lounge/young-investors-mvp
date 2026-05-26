import { useState } from "react";
import clsx from "clsx";
import { ChefHat, LockKeyhole, Vote } from "lucide-react";
import { BrutalistButton } from "@/components/BrutalistButton";
import { BrutalistCard } from "@/components/BrutalistCard";
import { ConsensusBar } from "@/components/ConsensusBar";
import { calculateConsensus, formatMoney } from "@/lib/domain";
import type { AcademyClearance, GovernanceModel, TradeProposal } from "@/lib/types";

interface KitchenViewProps {
  proposals: TradeProposal[];
  clearance: AcademyClearance;
  onVote: (proposalId: string, vote: "YES" | "NO") => void;
}

const MODEL_LABELS: Record<GovernanceModel, string> = {
  mutual: "Mutual Kitchen",
  hedge: "Hedge Kitchen",
};

const MODEL_DESCRIPTIONS: Record<GovernanceModel, string> = {
  mutual: "Slow cook, long game. Democratic consensus, diversified plates, patient capital. Every chef has equal vote weight. The table decides together.",
  hedge: "High heat, strict rules. Asymmetric strategies, shorter holds, non-negotiable exit discipline. The mandate is precise and the kitchen runs hot.",
};

export function KitchenView({ proposals, clearance, onVote }: KitchenViewProps) {
  const [model, setModel] = useState<GovernanceModel>("mutual");

  const filtered = proposals.filter((p) => p.governanceModel === model);

  return (
    <section className="stack" aria-labelledby="kitchen-heading">
      <div>
        <p className="eyebrow">The Kitchen Floor / recipes, taste votes, table consensus</p>
        <h2 id="kitchen-heading" className="view-title">The Kitchen</h2>
      </div>

      {/* Governance model selector */}
      <BrutalistCard as="div">
        <p className="eyebrow">Choose your governance model</p>
        <div className="model-toggle" role="group" aria-label="Governance model">
          {(["mutual", "hedge"] as GovernanceModel[]).map((m) => (
            <button
              key={m}
              type="button"
              className={clsx("model-button", model === m && "model-button-active")}
              aria-pressed={model === m}
              onClick={() => setModel(m)}
            >
              <span className="model-button-label">{MODEL_LABELS[m]}</span>
            </button>
          ))}
        </div>
        <p className="copy" style={{ marginTop: 12 }}>{MODEL_DESCRIPTIONS[model]}</p>
        <div className="status-line" style={{ marginTop: 10 }}>
          <span className="badge">{filtered.length} live {filtered.length === 1 ? "recipe" : "recipes"}</span>
          <BrutalistButton icon={<ChefHat className="icon-inline" aria-hidden="true" />} disabled>
            Draft recipe
          </BrutalistButton>
          <span className="meta">Recipe drafting remains MOCK_MVP until the API is stable.</span>
        </div>
      </BrutalistCard>

      {!clearance.complete && (
        <BrutalistCard critical>
          <div className="status-line">
            <LockKeyhole className="icon-inline" aria-hidden="true" />
            <span className="badge badge-critical">Learn before you earn</span>
          </div>
          <p className="copy">
            You can read every recipe on the table, but proposals, tasting votes, and collective
            mock execution stay locked until the required Academy lessons are passed.
          </p>
        </BrutalistCard>
      )}

      {filtered.length === 0 && (
        <BrutalistCard as="div">
          <p className="copy" style={{ textAlign: "center", padding: "24px 0" }}>
            No live recipes for the {MODEL_LABELS[model]} right now. Draft the first one when your Kitchen is ready.
          </p>
        </BrutalistCard>
      )}

      <div className="grid grid-two">
        {filtered.map((proposal) => {
          const consensus = calculateConsensus(proposal.votes);

          return (
            <BrutalistCard key={proposal.id}>
              <div className="proposal-heading">
                <div className="split-row">
                  <span className="badge">{proposal.kitchenName}</span>
                  <span className="badge">{proposal.proposedSide}</span>
                </div>
                <span className="proposal-symbol ticker">{proposal.symbol}</span>
                <h3 className="section-title">{proposal.assetName}</h3>
              </div>

              <p className="copy">{proposal.thesis}</p>

              <div className="metric-block">
                <p className="meta">Paper plate / Units</p>
                <p className="metric-number">
                  {formatMoney(proposal.paperNotional)} / {proposal.proposedUnits}
                </p>
              </div>

              <ConsensusBar votes={proposal.votes} />

              <div className="status-line">
                <span className="badge">YES {proposal.votes.yes}</span>
                <span className="badge">NO {proposal.votes.no}</span>
                <span className="badge">PASS {proposal.votes.abstain}</span>
                <span className={consensus.quorumMet ? "badge badge-positive" : "badge badge-watch"}>
                  {consensus.quorumMet ? "Kitchen at table" : "Too many chefs missing"}
                </span>
              </div>

              <div className="vote-row">
                <BrutalistButton
                  icon={<Vote className="icon-inline" aria-hidden="true" />}
                  disabled={!clearance.complete}
                  active={proposal.userVote === "YES"}
                  onClick={() => clearance.complete && onVote(proposal.id, "YES")}
                >
                  Taste YES
                </BrutalistButton>
                <BrutalistButton
                  icon={<Vote className="icon-inline" aria-hidden="true" />}
                  disabled={!clearance.complete}
                  active={proposal.userVote === "NO"}
                  onClick={() => clearance.complete && onVote(proposal.id, "NO")}
                >
                  Vote NO
                </BrutalistButton>
              </div>

              <p className={proposal.riskNote.toLowerCase().includes("critical") ? "meta critical" : "meta"}>
                Gordon says: {proposal.riskNote}
              </p>
            </BrutalistCard>
          );
        })}
      </div>
    </section>
  );
}
