"use client";

/**
 * JSE market browser — minimal, icon-led, tap-to-expand.
 *
 * Reduces visual load: a collapsed row is mostly a heat dot + symbol + price (the
 * eye reads colour and number, not paragraphs). Tap a row to reveal Gordon's heat
 * check — computed from the company's simulated history (volatility, drawdown, trend)
 * — plus a sparkline. Progressive disclosure, lucide icons, no emojis.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — simulated prices + history, never financial advice.
 */

import { useState } from "react";
import { ChevronDown, Flame, Minus, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useJseMarket } from "@/lib/useJseMarket";
import { companyHistory, gordonHeatCheck } from "@/lib/jseHistory";
import { tap } from "@/lib/haptics";
import type { JseStock } from "@/lib/jseMarket";

function rand(n: number): string {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function changeColor(v: number): string {
  return v > 0.05 ? "#167a3a" : v < -0.05 ? "#b42318" : "var(--yi-muted)";
}

function Sparkline({ stock }: { stock: JseStock }) {
  const pts = companyHistory(stock).points;
  if (pts.length < 2) return null;
  const ys = pts.map((p) => p.price);
  const min = Math.min(...ys);
  const span = Math.max(...ys) - min || 1;
  const w = 240;
  const h = 40;
  const d = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p.price - min) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const up = ys[ys.length - 1] >= ys[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={up ? "#167a3a" : "#b42318"} strokeWidth={1.5} />
    </svg>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp size={13} strokeWidth={1.9} aria-hidden style={{ color: "#167a3a" }} />;
  if (trend === "down") return <TrendingDown size={13} strokeWidth={1.9} aria-hidden style={{ color: "#b42318" }} />;
  return <Minus size={13} strokeWidth={1.9} aria-hidden style={{ color: "var(--yi-muted)" }} />;
}

export function JSEMarket() {
  const { stocks, mode, confidence } = useJseMarket();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const list = q
    ? stocks.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q))
    : stocks;

  return (
    <section style={{ display: "grid", gap: 12 }}>
      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--yi-frame)", padding: "0 12px", minHeight: 44 }}>
        <Search size={15} strokeWidth={1.8} aria-hidden style={{ color: "var(--yi-muted)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the JSE Top 40 — symbol, name, sector"
          aria-label="Search JSE stocks"
          style={{ flex: 1, border: "none", background: "transparent", color: "var(--yi-ink)", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", outline: "none", minHeight: 42 }}
        />
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)" }}>{list.length}</span>
      </div>
      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em", color: mode === "public" ? "#167a3a" : "var(--yi-muted)", margin: 0 }}>
        Data: {mode === "public" ? "public quote feed" : mode === "fallback" ? "fallback simulation" : "simulation"} · {confidence}
      </p>

      {/* List */}
      <div style={{ border: "1px solid var(--yi-frame)" }}>
        {list.map((s, i) => {
          const hc = gordonHeatCheck(s);
          const isOpen = open === s.symbol;
          return (
            <div key={s.symbol} style={{ borderBottom: i < list.length - 1 ? "1px solid var(--yi-hairline)" : "none" }}>
              {/* Collapsed row — minimal: heat dot · symbol · price · change · chevron */}
              <button
                type="button"
                onClick={() => { tap(); setOpen(isOpen ? null : s.symbol); }}
                aria-expanded={isOpen}
                style={{ width: "100%", display: "grid", gridTemplateColumns: "12px 1fr auto auto 16px", alignItems: "center", gap: 10, padding: "11px 12px", background: isOpen ? "var(--yi-soft)" : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <span title={hc.tier.label} style={{ width: 10, height: 10, borderRadius: "50%", background: hc.tier.color, display: "inline-block" }} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.86rem", color: "var(--yi-ink)", letterSpacing: "0.02em" }}>{s.symbol}</span>
                  <span style={{ display: "block", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.66rem", color: "var(--yi-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                </span>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.82rem", color: "var(--yi-ink)", textAlign: "right" }}>{rand(s.price)}</span>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", color: changeColor(s.change), textAlign: "right", minWidth: 52 }}>
                  {s.change >= 0 ? "+" : ""}{s.change.toFixed(1)}%
                </span>
                <ChevronDown size={15} strokeWidth={1.8} aria-hidden style={{ color: "var(--yi-muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
              </button>

              {/* Expanded — Gordon's heat check from history */}
              {isOpen && (
                <div style={{ padding: "4px 14px 16px", display: "grid", gap: 12 }}>
                  <Sparkline stock={s} />

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Flame size={14} strokeWidth={1.9} aria-hidden style={{ color: hc.tier.color }} />
                    <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: hc.tier.color }}>
                      Gordon · {hc.tier.label} · {hc.score}/100
                    </span>
                    <TrendIcon trend={hc.trend} />
                  </div>

                  {/* Driver bars — iconic, not paragraphs */}
                  <div style={{ display: "grid", gap: 6 }}>
                    {hc.drivers.map((d) => (
                      <div key={d.label} style={{ display: "grid", gridTemplateColumns: "120px 1fr 64px", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--yi-muted)" }}>{d.label}</span>
                        <span style={{ height: 6, background: "var(--yi-hairline)", position: "relative", display: "block" }}>
                          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(100, d.load)}%`, background: hc.tier.color }} />
                        </span>
                        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", color: "var(--yi-ink)", textAlign: "right" }}>{d.value}</span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.85rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0 }}>
                    {hc.meaning}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
                    {s.sector} · {s.quoteConfidence ?? hc.confidence}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", padding: "16px 14px", margin: 0 }}>
            No match. Try a symbol like NPN or a sector like banks.
          </p>
        )}
      </div>
    </section>
  );
}
