"use client";

/**
 * Idle-capital inflation eroder — shared by the live Vault gate and VaultView.
 * Educational simulation only; the SARB rate is an illustrative mock.
 */

import { useEffect, useState } from "react";
import { TrendingDown } from "lucide-react";

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

export function InflationEroderCard({
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
