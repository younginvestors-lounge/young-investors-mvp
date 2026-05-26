import { Brain, ChefHat, Gauge, GraduationCap, Vote } from "lucide-react";
import { calculateConsensus, formatPercent } from "@/lib/domain";
import type {
  AcademyClearance,
  AcademyModule,
  PortfolioSnapshot,
  TradeProposal,
} from "@/lib/types";

interface KitchenGordonPanelProps {
  clearance: AcademyClearance;
  modules: AcademyModule[];
  portfolio: PortfolioSnapshot;
  proposals: TradeProposal[];
}

export function KitchenGordonPanel({
  clearance,
  modules,
  portfolio,
  proposals,
}: KitchenGordonPanelProps) {
  const passedModuleCount = modules.filter((module) => module.passed).length;
  const academyProgress =
    modules.length === 0 ? 0 : Math.round((passedModuleCount / modules.length) * 100);
  const consensusReads = proposals.map((proposal) => calculateConsensus(proposal.votes));
  const approvedProposalCount = consensusReads.filter((read) => read.approved).length;
  const averageConsensus =
    consensusReads.length === 0
      ? 0
      : Math.round(
          consensusReads.reduce((total, read) => total + read.yesPercent, 0) /
            consensusReads.length,
        );
  const riskScore = portfolio.gordonMarketRead.riskScore;
  const riskTone =
    portfolio.gordonMarketRead.criticalAlerts.length > 0 || riskScore >= 70
      ? "metric-negative"
      : riskScore >= 50
        ? "metric-watch"
        : "metric-positive";
  const roiTone =
    portfolio.roiPercent > 0
      ? "metric-positive"
      : portfolio.roiPercent < 0
        ? "metric-negative"
        : "metric-watch";

  return (
    <section className="kitchen-gordon-panel" aria-labelledby="gordon-progress-heading">
      <div className="kitchen-gordon-lede">
        <div className="status-line">
          <Brain className="icon-inline" aria-hidden="true" />
          <span className="badge">The Kitchen</span>
          <span className="badge">
            <ChefHat className="icon-inline" aria-hidden="true" />
            We Cook
          </span>
        </div>
        <h2 id="gordon-progress-heading" className="section-title">
          Your Kitchen, your table, your next recipe
        </h2>
        <p className="copy">
          The Kitchen can only cook after the Academy, the Kitchen Floor, the 60% Rule, and
          Gordon's heat check all agree. Paper mode stays explicit while the culture stays
          personal.
        </p>
      </div>

      <div className="kitchen-progress-grid" aria-label="Kitchen progress metrics">
        <div className="progress-tile">
          <div className="metric-row">
            <span className="meta">
              <GraduationCap className="icon-inline" aria-hidden="true" />
              Learn before you earn
            </span>
            <span className={clearance.complete ? "number metric-positive" : "number metric-negative"}>
              {academyProgress}%
            </span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div
              className={clearance.complete ? "progress-fill-positive" : "progress-fill-negative"}
              style={{ width: `${academyProgress}%` }}
            />
          </div>
          <p className="meta">
            {clearance.complete
              ? "Ready to enter The Kitchen"
              : `${clearance.missingModuleIds.length} lesson standing between you and the table`}
          </p>
        </div>

        <div className="progress-tile">
          <div className="metric-row">
            <span className="meta">
              <Vote className="icon-inline" aria-hidden="true" />
              Recipe readiness
            </span>
            <span
              className={
                averageConsensus >= 60 ? "number metric-positive" : "number metric-watch"
              }
            >
              {averageConsensus}%
            </span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div
              className={averageConsensus >= 60 ? "progress-fill-positive" : "progress-fill-watch"}
              style={{ width: `${averageConsensus}%` }}
            />
          </div>
          <p className="meta">
            {approvedProposalCount}/{proposals.length} recipes have the Kitchen ready to cook
          </p>
        </div>

        <div className="progress-tile">
          <div className="metric-row">
            <span className="meta">
              <Gauge className="icon-inline" aria-hidden="true" />
              Gordon's heat check
            </span>
            <span className={`number ${riskTone}`}>{riskScore}</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div className={riskTone.replace("metric", "progress-fill")} style={{ width: `${riskScore}%` }} />
          </div>
          <p className="meta">
            {portfolio.gordonMarketRead.criticalAlerts.length === 0
              ? "No hot pots flagged"
              : "Gordon says wait; the pot is too hot"}
          </p>
        </div>

        <div className="progress-tile">
          <div className="metric-row">
            <span className="meta">Vault lift</span>
            <span className={`number ${roiTone}`}>{formatPercent(portfolio.roiPercent)}</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div
              className={roiTone.replace("metric", "progress-fill")}
              style={{ width: `${Math.min(Math.abs(portfolio.roiPercent) * 8, 100)}%` }}
            />
          </div>
          <p className="meta">MOCK_MVP_PAPER_TRADING_ONLY snapshot</p>
        </div>
      </div>
    </section>
  );
}
