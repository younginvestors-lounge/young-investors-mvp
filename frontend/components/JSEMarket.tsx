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

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Flame, Minus, ReceiptText, Scale, Search, ShoppingBasket, TrendingDown, TrendingUp, X } from "lucide-react";
import { useJseMarket } from "@/lib/useJseMarket";
import { companyHistory, gordonHeatCheck } from "@/lib/jseHistory";
import { tap } from "@/lib/haptics";
import { addShelfReceipt, type ShelfDecision } from "@/lib/shelfStore";
import { notifyTask } from "@/lib/taskToast";
import { useAuth } from "@/lib/auth-context";
import { rememberGordonChefReason } from "@/lib/gordonKnowledgeBank";
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

const DECISIONS: ShelfDecision[] = ["BUY", "SELL", "HOLD"];

function ShelfDecisionPanel({ stock, onClose }: { stock: JseStock; onClose: () => void }) {
  const { user } = useAuth();
  const heatCheck = useMemo(() => gordonHeatCheck(stock), [stock]);
  const [decision, setDecision] = useState<ShelfDecision>("BUY");
  const [weightPercent, setWeightPercent] = useState(10);
  const [reason, setReason] = useState(() => `Gordon heat check: ${heatCheck.tier.label}. My Kitchen reason is `);
  const notional = Math.round(1001 * (weightPercent / 100) * 100) / 100;
  const units = stock.price > 0 ? Number((notional / stock.price).toFixed(4)) : 0;

  function submitShelfReceipt() {
    const receipt = addShelfReceipt({ stock, decision, weightPercent, reason });
    if (user) {
      rememberGordonChefReason(user.id, {
        source: "shop",
        action: "prediction",
        ticker: stock.symbol,
        assetName: stock.name,
        side: decision === "HOLD" ? undefined : decision,
        units: receipt.units,
        reason: `${decision} ${stock.symbol} at ${weightPercent}% plate weight: ${receipt.reason}`,
      });
    }
    tap();
    notifyTask("Shelf receipt created", `${receipt.decision} ${receipt.symbol} / ${receipt.weightPercent}% plate weight`);
    onClose();
  }

  return (
    <div style={{ border: "1px solid var(--yi-frame)", borderLeft: "2px solid var(--yi-black)", background: "var(--yi-card-bg)", padding: "14px 14px", display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--yi-muted)", margin: "0 0 6px" }}>
            3D touch / Shelf decision
          </p>
          <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.2rem", fontWeight: 600, lineHeight: 1.1, color: "var(--yi-ink)", margin: 0 }}>
            {stock.symbol} / {stock.name}
          </h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close Shelf decision" title="Close" style={{ width: 30, height: 30, border: "1px solid var(--yi-hairline)", background: "transparent", color: "var(--yi-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={15} strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: "1px solid var(--yi-frame)" }}>
        {DECISIONS.map((d, i) => {
          const active = decision === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => { setDecision(d); tap(); }}
              aria-pressed={active}
              style={{
                minHeight: 42,
                border: "none",
                borderRight: i < DECISIONS.length - 1 ? "1px solid var(--yi-frame)" : "none",
                background: active ? "var(--yi-black)" : "transparent",
                color: active ? "var(--yi-white)" : "var(--yi-ink)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      <label style={{ display: "grid", gap: 7 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)" }}>
            <Scale size={13} strokeWidth={1.8} aria-hidden /> Plate weight
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.68rem", color: "var(--yi-ink)" }}>{weightPercent}%</span>
        </span>
        <input
          type="range"
          min={1}
          max={30}
          step={1}
          value={weightPercent}
          onChange={(e) => setWeightPercent(Number(e.target.value))}
          aria-label="Set mock plate weight"
          style={{ width: "100%", accentColor: "var(--yi-black)" }}
        />
      </label>

      <label style={{ display: "grid", gap: 7 }}>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)" }}>
          Season your reason
        </span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          aria-label="Reason for Shelf decision"
          placeholder="Always know your reason. A reason can be repeated; a hunch cannot."
          style={{ width: "100%", border: "1px solid var(--yi-frame)", background: "var(--yi-paper)", color: "var(--yi-ink)", padding: "10px 11px", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.5, outline: "none", resize: "vertical" }}
        />
      </label>

      <div style={{ border: "1px solid var(--yi-frame)", background: "var(--yi-paper)", padding: "12px 12px", display: "grid", gap: 8 }}>
        <p style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: 0 }}>
          <ReceiptText size={13} strokeWidth={1.8} aria-hidden /> {decision === "SELL" ? "YI mock invoice of sale" : decision === "BUY" ? "YI mock purchase receipt" : "YI mock hold note"}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          {[
            ["Decision", decision],
            ["Price", rand(stock.price)],
            ["Weight", `${weightPercent}%`],
            ["Notional", rand(notional)],
            ["Units", String(units)],
            ["Mode", "PAPER"],
          ].map(([label, value]) => (
            <p key={label} style={{ margin: 0, minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: "var(--font-mono), monospace", fontSize: "0.48rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)" }}>{label}</span>
              <span style={{ display: "block", fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", color: "var(--yi-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
            </p>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={submitShelfReceipt}
        style={{ minHeight: 46, border: "none", background: "var(--yi-black)", color: "var(--yi-white)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 18px", fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
      >
        <ShoppingBasket size={15} strokeWidth={1.8} aria-hidden />
        Send to Shelf
      </button>
      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0, lineHeight: 1.5 }}>
        MOCK_MVP_PAPER_TRADING_ONLY / Not an order / For Kitchen voting
      </p>
    </div>
  );
}

export function JSEMarket() {
  const { stocks, mode, confidence } = useJseMarket();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [shelfStock, setShelfStock] = useState<JseStock | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const longPressHitRef = useRef(false);

  const q = query.trim().toLowerCase();
  const list = q
    ? stocks.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q))
    : stocks;

  function clearPressTimer() {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  function startLongPress(stock: JseStock) {
    clearPressTimer();
    longPressHitRef.current = false;
    pressTimerRef.current = window.setTimeout(() => {
      longPressHitRef.current = true;
      tap();
      setOpen(stock.symbol);
      setShelfStock(stock);
    }, 520);
  }

  function handleRowClick(stock: JseStock, isOpen: boolean) {
    clearPressTimer();
    if (longPressHitRef.current) {
      longPressHitRef.current = false;
      return;
    }
    tap();
    setOpen(isOpen ? null : stock.symbol);
  }

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

      {shelfStock && (
        <ShelfDecisionPanel stock={shelfStock} onClose={() => setShelfStock(null)} />
      )}

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
                onPointerDown={() => startLongPress(s)}
                onPointerUp={clearPressTimer}
                onPointerCancel={clearPressTimer}
                onPointerLeave={clearPressTimer}
                onContextMenu={(e) => { e.preventDefault(); setOpen(s.symbol); setShelfStock(s); }}
                onClick={() => handleRowClick(s, isOpen)}
                aria-expanded={isOpen}
                style={{ width: "100%", display: "grid", gridTemplateColumns: "12px 1fr auto auto 16px", alignItems: "center", gap: 10, padding: "11px 12px", background: isOpen ? "var(--yi-soft)" : "transparent", border: "none", cursor: "pointer", textAlign: "left", touchAction: "manipulation" }}
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
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0, lineHeight: 1.45 }}>
                    Long press for the Shelf / choose buy-sell-hold / set plate weight / create a mock receipt for Kitchen voting
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
