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
import { Gauge, Vault } from "lucide-react";
import { BrutalistCard } from "@/components/BrutalistCard";
import { KitchenContributionIntents, PersonalContributionIntents } from "@/components/ContributionIntents";
import { GordonPanel } from "@/components/GordonPanel";
import { InflationEroderCard } from "@/components/InflationEroder";
import { RevealBox } from "@/components/RevealBox";
import { formatMoney, formatPercent } from "@/lib/domain";
import { formatRand } from "@/lib/jseMarket";
import { getKitchenVaultLedger, type KitchenVaultLedger } from "@/lib/profileStore";
import type { DashboardTab, PortfolioSnapshot } from "@/lib/types";

const EMPTY_LEDGER: KitchenVaultLedger = { receipts: [], holdings: [] };

interface VaultViewProps {
  portfolio: PortfolioSnapshot;
  onTabChange?: (tab: DashboardTab) => void;
}

function metricToneClass(value: number): string {
  if (value > 0) return "metric-positive";
  if (value < 0) return "metric-negative";
  return "metric-watch";
}

const ALLOCATION_COLORS = ["#111111", "#444444", "#888888", "#b46918", "#b42318"];

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

export function VaultView({ portfolio, onTabChange }: VaultViewProps) {
  const [kitchenVault, setKitchenVault] = useState<KitchenVaultLedger>(EMPTY_LEDGER);

  // The Kitchen vote is the gate: what the table approves shows up here.
  useEffect(() => {
    let cancelled = false;
    getKitchenVaultLedger().then((ledger) => { if (!cancelled) setKitchenVault(ledger); });
    const t = setInterval(() => {
      getKitchenVaultLedger().then((ledger) => { if (!cancelled) setKitchenVault(ledger); });
    }, 10000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

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
        <p className="eyebrow">Production-shaped Vault · Paper only · No real deposits</p>
        <h2 id="vault-heading" className="view-title">The Vault</h2>
        <p className="subtitle">
          One page, two vaults: your Personal Vault and your Kitchen Vault. In production,
          the Kitchen Vault is the joint escrow/trust-account view. In this tester build,
          every balance, receipt, allocation, and execution state is paper-only.
        </p>
      </div>

      <div className="grid grid-three">
        <BrutalistCard>
          <p className="meta">Personal Vault</p>
          <p className="metric-number">R1,001</p>
          <p className="copy">
            Your individual practice capital, personal receipts, and readiness state. Paper
            deposit/withdrawal intents settle immediately below — no real money moves.
          </p>
        </BrutalistCard>
        <BrutalistCard>
          <p className="meta">Kitchen Vault</p>
          <p className="metric-number">{formatMoney(portfolio.totalSyndicateCapital)}</p>
          <p className="copy">
            The shared Kitchen vault: pooled mandate, voted allocations, paper receipts,
            and future joint escrow/trust-account state governed by the 60% Rule.
          </p>
        </BrutalistCard>
        <BrutalistCard>
          <p className="meta">Regulated rail</p>
          <p className="metric-number metric-watch">Off</p>
          <p className="copy">
            Bank, PSP, broker, FICA, escrow, and custody adapters remain disconnected until
            live-money review and regulatory approval exist.
          </p>
        </BrutalistCard>
      </div>

      {/* Inflation eroder: visible when no holdings are cooked yet */}
      <InflationEroderCard
        nominalAmount={portfolio.totalSyndicateCapital.amount}
        isIdle={isIdleCapital}
        currency={portfolio.totalSyndicateCapital.currency}
      />

      {/* Kitchen Vault — nothing appears here that the table did not vote through. */}
      <RevealBox
        symbol={<Vault size={15} strokeWidth={1.8} aria-hidden />}
        title="Kitchen Vault"
        meta={kitchenVault.receipts.length > 0 ? `${kitchenVault.receipts.length} recipe${kitchenVault.receipts.length !== 1 ? "s" : ""} executed` : "No recipes executed yet"}
        defaultOpen={kitchenVault.receipts.length > 0}
      >
        {kitchenVault.receipts.length === 0 ? (
          <p className="copy" style={{ margin: 0 }}>
            Your Kitchen&apos;s shared holdings will show up here once a recipe crosses the 60% Rule. Vote a recipe through in the Kitchen tab to see it land as a paper receipt.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div className="grid grid-three">
              {kitchenVault.holdings.map((h) => (
                <BrutalistCard key={h.ticker}>
                  <p className="meta">Kitchen holding</p>
                  <p className="proposal-symbol ticker">{h.ticker}</p>
                  <p className="metric-number">{formatRand(h.netNotional)}</p>
                  <p className="meta">{h.netUnits > 0 ? "+" : ""}{h.netUnits} net units</p>
                </BrutalistCard>
              ))}
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {kitchenVault.receipts.slice(0, 5).map((r) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", border: "1px solid var(--yi-frame)", padding: "8px 12px" }}>
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem" }}>{r.side} {r.ticker} · {r.units} units</span>
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", color: "var(--yi-muted)" }}>
                    {r.notional != null ? formatRand(r.notional) : ""} · {new Date(r.executedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </RevealBox>

      {/* Contribution intents — the production-shaped deposit/withdrawal workflow,
          paper-only until a live-money review approves real settlement. */}
      <RevealBox
        symbol={<Vault size={15} strokeWidth={1.8} aria-hidden />}
        title="Contribution Intents"
        meta="Personal settles instantly · Kitchen needs a co-signer"
      >
        <div style={{ display: "grid", gap: 20 }}>
          <div>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 10px" }}>
              Personal Vault
            </p>
            <PersonalContributionIntents />
          </div>
          <div style={{ borderTop: "1px solid var(--yi-hairline)", paddingTop: 16 }}>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 10px" }}>
              Kitchen Vault
            </p>
            <KitchenContributionIntents />
          </div>
        </div>
      </RevealBox>

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

      {onTabChange && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => onTabChange("kitchen")} style={{ background: "transparent", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Vote another recipe in the Kitchen →
          </button>
          <button type="button" onClick={() => onTabChange("lounge")} style={{ background: "transparent", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Compare in the Lounge →
          </button>
        </div>
      )}
    </section>
  );
}

function AllocationBarChart({ portfolio }: { portfolio: PortfolioSnapshot }) {
  return <SectorAllocationChart holdings={portfolio.holdings} />;
}
