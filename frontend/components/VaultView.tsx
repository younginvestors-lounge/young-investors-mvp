"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Gauge, TrendingDown, Vault } from "lucide-react";
import { BrutalistCard } from "@/components/BrutalistCard";
import { GordonPanel } from "@/components/GordonPanel";
import { RevealBox } from "@/components/RevealBox";
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

const ALLOCATION_COLORS = ["#111111", "#444444", "#888888", "#b46918", "#b42318"];

// SARB mock inflation rate: 4.5% p.a. (published annually; labeled as educational mock)
const SARB_MOCK_RATE = 0.045;
// Simulation speed: 1 simulated day every 8 real seconds (86400× real speed)
const SIM_TICK_MS = 8_000;

/**
 * Tracks simulated idle-capital inflation erosion in real time.
 * Every SIM_TICK_MS we advance 1 simulated day and recompute real value.
 * The hook pauses when the chef has holdings (invested capital isn't idle).
 */
function useInflationSim(nominalAmount: number, isIdle: boolean) {
  const [simDays, setSimDays] = useState(0);

  useEffect(() => {
    if (!isIdle) return;
    const id = setInterval(() => setSimDays((d) => d + 1), SIM_TICK_MS);
    return () => clearInterval(id);
  }, [isIdle]);

  const dailyErosion = (nominalAmount * SARB_MOCK_RATE) / 365;
  // Continuous compound: real = nominal / (1 + rate)^(days/365)
  const realValue = nominalAmount / Math.pow(1 + SARB_MOCK_RATE, simDays / 365);
  const cumulativeLoss = nominalAmount - realValue;

  return { simDays, realValue, cumulativeLoss, dailyErosion };
}

function InflationEroderCard({
  nominalAmount,
  isIdle,
  currency,
}: {
  nominalAmount: number;
  isIdle: boolean;
  currency: string;
}) {
  const { simDays, realValue, cumulativeLoss, dailyErosion } = useInflationSim(nominalAmount, isIdle);
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency, minimumFractionDigits: 2 }).format(v);
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono), monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em" };

  if (!isIdle) return null;

  return (
    <div style={{ border: "1px solid #b42318", padding: "16px 18px", background: "var(--yi-card-bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <TrendingDown size={15} strokeWidth={1.8} style={{ color: "#b42318", flexShrink: 0 }} aria-hidden />
        <p style={{ ...mono, fontSize: "0.6rem", color: "#b42318", margin: 0 }}>
          Idle Capital · Inflation Eroder
        </p>
      </div>
      <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--yi-ink)", margin: "0 0 4px", lineHeight: 1.2 }}>
        Unproductive capital is leaking.
      </p>
      <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.86rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: "0 0 14px" }}>
        Money sitting still is not neutral. At the Reserve Bank&apos;s current rate, inflation silently
        erodes its real purchasing power. This is the psychology of unproductive capital —
        whether as inputs or derivatives of expected company outputs.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ border: "1px solid var(--yi-frame)", padding: "10px 12px" }}>
          <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: "0 0 4px" }}>Nominal (paper)</p>
          <p style={{ ...mono, fontSize: "0.92rem", fontWeight: 700, color: "var(--yi-ink)", margin: 0 }}>{fmt(nominalAmount)}</p>
        </div>
        <div style={{ border: "1px solid #b42318", padding: "10px 12px" }}>
          <p style={{ ...mono, fontSize: "0.52rem", color: "#b42318", margin: "0 0 4px" }}>Real value now</p>
          <p style={{ ...mono, fontSize: "0.92rem", fontWeight: 700, color: "#b42318", margin: 0 }}>{fmt(realValue)}</p>
        </div>
        <div style={{ border: "1px solid var(--yi-frame)", padding: "10px 12px" }}>
          <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: "0 0 4px" }}>Lost to inflation</p>
          <p style={{ ...mono, fontSize: "0.92rem", fontWeight: 700, color: "#b42318", margin: 0 }}>−{fmt(cumulativeLoss)}</p>
        </div>
        <div style={{ border: "1px solid var(--yi-frame)", padding: "10px 12px" }}>
          <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: "0 0 4px" }}>Daily drain</p>
          <p style={{ ...mono, fontSize: "0.92rem", fontWeight: 700, color: "#b46918", margin: 0 }}>−{fmt(dailyErosion)}</p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: 0 }}>
          Sim day {simDays} · SARB mock rate {(SARB_MOCK_RATE * 100).toFixed(1)}% p.a. · 1 day per 8 sec
        </p>
        <p style={{ ...mono, fontSize: "0.52rem", color: "#b42318", margin: 0 }}>Put it to work. Cook a recipe.</p>
      </div>
      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: "8px 0 0" }}>
        Educational simulation · Not financial advice · Reserve Bank rate is illustrative only
      </p>
    </div>
  );
}

function AllocationBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div style={{ position: "relative", height: 6, background: "var(--yi-soft)", width: "100%", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, right: `${100 - percent}%`, background: color, transition: "right 400ms ease" }} />
    </div>
  );
}

function SectorAllocationChart({ holdings }: { holdings: PortfolioSnapshot["holdings"] }) {
  const total = holdings.reduce((sum, h) => sum + h.allocationPercent, 0);
  const segments = holdings.map((h, i) => ({
    ...h,
    color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
    pct: total > 0 ? (h.allocationPercent / total) * 100 : 0,
  }));

  return (
    <div>
      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 10px" }}>
        Plate weight distribution
      </p>
      {/* Stacked horizontal bar */}
      <div style={{ display: "flex", height: 12, border: "1px solid var(--yi-frame)", overflow: "hidden", marginBottom: 14 }}>
        {segments.map((s) => (
          <div key={s.symbol} style={{ flex: s.pct, background: s.color, transition: "flex 400ms ease", minWidth: 0 }} title={`${s.symbol}: ${s.allocationPercent.toFixed(1)}%`} />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: "grid", gap: 6 }}>
        {segments.map((s) => (
          <div key={s.symbol} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 10, height: 10, background: s.color, flexShrink: 0 }} />
            <div style={{ display: "flex", gap: 6, alignItems: "baseline", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-ink)", flexShrink: 0, width: 48 }}>
                {s.symbol}
              </span>
              <AllocationBar percent={s.allocationPercent} color={s.color} />
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem", color: "var(--yi-muted)", flexShrink: 0, width: 36, textAlign: "right" }}>
                {s.allocationPercent.toFixed(1)}%
              </span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", color: s.roiPercent >= 0 ? "#167a3a" : "#b42318", flexShrink: 0, width: 44, textAlign: "right" }}>
                {formatPercent(s.roiPercent)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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

  const highestAlloc = portfolio.holdings.reduce((a, b) => a.allocationPercent > b.allocationPercent ? a : b);
  const concentrationWarning = highestAlloc.allocationPercent > 35;
  // Idle capital = chef hasn't cooked any recipes yet (no holdings in this demo mode)
  const isIdleCapital = portfolio.holdings.length === 0;

  return (
    <section className="stack" aria-labelledby="vault-heading">
      <div>
        <p className="eyebrow">Paper simulation · Kitchen snapshot · No real funds</p>
        <h2 id="vault-heading" className="view-title">The Vault</h2>
        <p className="subtitle">
          Every chef starts with R1,001 in practice capital. A Kitchen of 3 opens with a
          minimum vault of R3,003 — your collective starting point. Cook recipes, watch it
          move. Leave it idle and inflation eats the real value. No real money.
        </p>
      </div>

      {/* Inflation eroder: visible when no holdings are cooked yet */}
      <InflationEroderCard
        nominalAmount={portfolio.totalSyndicateCapital.amount}
        isIdle={isIdleCapital}
        currency={portfolio.totalSyndicateCapital.currency}
      />

      <RevealBox symbol={<Vault size={15} strokeWidth={1.8} aria-hidden />} title="Vault Summary" meta="Paper balance, lift, level, heat" defaultOpen tone={portfolio.roiPercent >= 0 ? "positive" : "negative"}>
      <div className="grid grid-three">
        <BrutalistCard>
          <div className="status-line">
            <Vault className="icon-inline" aria-hidden="true" />
            <span className="badge">Paper balance</span>
          </div>
          <p className="meta">Simulated Kitchen pool</p>
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
          <p className="meta">{levelProgress}% toward next level</p>
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
          <p className="meta">{heatScore >= 70 ? "The pot is too hot" : heatScore >= 50 ? "Warm — watch closely" : "Controlled heat"}</p>
        </BrutalistCard>
      </div>
      </RevealBox>

      {/* 7-day equity line */}
      <RevealBox symbol={<Gauge size={15} strokeWidth={1.8} aria-hidden />} title="7-day Vault Line" meta="Simulated portfolio path">
      <BrutalistCard>
        <h3 className="section-title">7-day Vault line</h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolio.sevenDayEquity} margin={{ top: 20, right: 20, bottom: 8, left: 8 }}>
              <XAxis dataKey="day" stroke="#111111" tick={{ fill: "#111111", fontFamily: "var(--yi-mono)" }} />
              <YAxis stroke="#111111" tick={{ fill: "#111111", fontFamily: "var(--yi-mono)" }} width={72} />
              <Tooltip
                contentStyle={{ background: "#ffffff", border: "1px solid #111111", color: "#111111", fontFamily: "var(--yi-mono)" }}
                labelStyle={{ color: "#111111" }}
                itemStyle={{ color: "#111111" }}
              />
              <Line type="linear" dataKey="value" stroke={equityLineColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </BrutalistCard>
      </RevealBox>

      {/* Plate weight / allocation chart */}
      <RevealBox symbol={<Gauge size={15} strokeWidth={1.8} aria-hidden />} title="Plate Weight" meta="Holdings and concentration" tone={concentrationWarning ? "negative" : "neutral"}>
      <BrutalistCard critical={concentrationWarning}>
        <h3 className="section-title">Holdings · Plate weight</h3>
        {concentrationWarning && (
          <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 10, marginBottom: 14 }}>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#b42318", margin: "0 0 4px" }}>
              Gordon · Concentration flag
            </p>
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.85rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0 }}>
              {highestAlloc.symbol} is {highestAlloc.allocationPercent.toFixed(1)}% of this Vault. This plate is too heavy on one side. Gordon recommends a rebalance before the next recipe.
            </p>
          </div>
        )}
        <AllocationBarChart portfolio={portfolio} />
      </BrutalistCard>
      </RevealBox>

      {/* Individual holdings */}
      <RevealBox symbol={<Vault size={15} strokeWidth={1.8} aria-hidden />} title="Holdings Shelf" meta={`${portfolio.holdings.length} simulated holdings`}>
      <div className="grid grid-three">
        {portfolio.holdings.map((holding, i) => (
          <BrutalistCard key={holding.symbol}>
            <div className="holding-row">
              <span className="proposal-symbol ticker">{holding.symbol}</span>
              <span className={`badge ${metricToneClass(holding.roiPercent)}`}>
                {formatPercent(holding.roiPercent)}
              </span>
            </div>
            <h3 className="section-title">{holding.name}</h3>
            <p className="meta">Servings: {holding.units}</p>
            <p className="metric-number">{formatMoney(holding.paperValue)}</p>
            <div style={{ marginTop: 6 }}>
              <AllocationBar percent={holding.allocationPercent} color={ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]} />
              <p className="meta" style={{ marginTop: 4 }}>Plate weight {holding.allocationPercent.toFixed(1)}%</p>
            </div>
          </BrutalistCard>
        ))}
      </div>
      </RevealBox>

      <GordonPanel read={portfolio.gordonMarketRead} />
    </section>
  );
}

function AllocationBarChart({ portfolio }: { portfolio: PortfolioSnapshot }) {
  return <SectorAllocationChart holdings={portfolio.holdings} />;
}
