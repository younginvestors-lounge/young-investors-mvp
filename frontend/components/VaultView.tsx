import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Gauge, Vault } from "lucide-react";
import { BrutalistCard } from "@/components/BrutalistCard";
import { GordonPanel } from "@/components/GordonPanel";
import { formatMoney, formatPercent } from "@/lib/domain";
import type { PortfolioSnapshot } from "@/lib/types";

interface VaultViewProps {
  portfolio: PortfolioSnapshot;
}

function metricToneClass(value: number): string {
  if (value > 0) return "metric-positive";
  if (value < 0) return "metric-negative";
  return "metric-watch";
}

export function VaultView({ portfolio }: VaultViewProps) {
  const equityLineColor = portfolio.roiPercent >= 0 ? "#167a3a" : "#b42318";
  const vaultLevel = portfolio.roiPercent >= 8 ? "Level 03" : portfolio.roiPercent >= 4 ? "Level 02" : "Level 01";
  const levelProgress = Math.min(Math.max(Math.round((portfolio.roiPercent / 12) * 100), 0), 100);
  const heatScore = portfolio.gordonMarketRead.riskScore;
  const heatTone =
    portfolio.gordonMarketRead.criticalAlerts.length > 0 || heatScore >= 70
      ? "metric-negative"
      : heatScore >= 50
        ? "metric-watch"
        : "metric-positive";

  return (
    <section className="stack" aria-labelledby="vault-heading">
      <div>
        <p className="eyebrow">Personal Kitchen metrics / secured capital view</p>
        <h2 id="vault-heading" className="view-title">The Vault</h2>
        <p className="subtitle">
          A private ledger for your Kitchen capital, holdings, levels, progress, ROI, and the heat
          profile Gordon quietly watches from the side.
        </p>
      </div>

      <div className="grid grid-three">
        <BrutalistCard>
          <div className="status-line">
            <Vault className="icon-inline" aria-hidden="true" />
            <span className="badge">Secured capital</span>
          </div>
          <p className="meta">Kitchen paper capital added</p>
          <p className="metric-number">{formatMoney(portfolio.totalSyndicateCapital)}</p>
          <p className="meta">{portfolio.totalSyndicateCapital.mode}</p>
        </BrutalistCard>
        <BrutalistCard>
          <p className="meta">Vault lift</p>
          <p className={`metric-number ${metricToneClass(portfolio.roiPercent)}`}>
            {formatPercent(portfolio.roiPercent)}
          </p>
          <p className="meta">Simulated Kitchen snapshot</p>
        </BrutalistCard>
        <BrutalistCard>
          <p className="meta">Level reached</p>
          <p className="metric-number">{vaultLevel}</p>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill-positive" style={{ width: `${levelProgress}%` }} />
          </div>
          <p className="meta">{levelProgress}% toward the next vault level</p>
        </BrutalistCard>
        <BrutalistCard>
          <div className="status-line">
            <Gauge className="icon-inline" aria-hidden="true" />
            <span className="badge">Heat profile</span>
          </div>
          <p className={`metric-number ${heatTone}`}>{heatScore}</p>
          <div className="progress-track" aria-hidden="true">
            <div className={heatTone.replace("metric", "progress-fill")} style={{ width: `${heatScore}%` }} />
          </div>
          <p className="meta">Gordon and Sicilia notes stay supporting, never central.</p>
        </BrutalistCard>
      </div>

      <BrutalistCard>
        <h3 className="section-title">7-day Vault line</h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolio.sevenDayEquity} margin={{ top: 20, right: 20, bottom: 8, left: 8 }}>
              <XAxis dataKey="day" stroke="#111111" tick={{ fill: "#111111", fontFamily: "var(--yi-mono)" }} />
              <YAxis
                stroke="#111111"
                tick={{ fill: "#111111", fontFamily: "var(--yi-mono)" }}
                width={72}
              />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #111111",
                  color: "#111111",
                  fontFamily: "var(--yi-mono)",
                }}
                labelStyle={{ color: "#111111" }}
                itemStyle={{ color: "#111111" }}
              />
              <Line type="linear" dataKey="value" stroke={equityLineColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </BrutalistCard>

      <div className="grid grid-three">
        {portfolio.holdings.map((holding) => (
          <BrutalistCard key={holding.symbol}>
            <div className="holding-row">
              <span className="proposal-symbol ticker">{holding.symbol}</span>
              <span className={`badge ${metricToneClass(holding.roiPercent)}`}>
                {formatPercent(holding.roiPercent)}
              </span>
            </div>
            <h3 className="section-title">{holding.name}</h3>
            <p className="meta">Servings {holding.units}</p>
            <p className="metric-number">{formatMoney(holding.paperValue)}</p>
            <p className="meta">Plate weight {holding.allocationPercent.toFixed(1)}%</p>
          </BrutalistCard>
        ))}
      </div>

      <GordonPanel read={portfolio.gordonMarketRead} />
    </section>
  );
}
