"use client";

import { useEffect, useState } from "react";
import type { RankingRow } from "@/lib/types";
import { formatPercent } from "@/lib/domain";

interface LoungeViewProps {
  rankings: RankingRow[];
}

const RANK_LADDER = [
  { label: "Commis",         note: "First steps in the Kitchen" },
  { label: "Chef de Partie", note: "You know your station" },
  { label: "Sous Chef",      note: "Ready to lead a section" },
  { label: "Chef de Cuisine",note: "The Kitchen is yours" },
  { label: "Michelin Star",  note: "The Lounge remembers you" },
];

export function LoungeView({ rankings }: LoungeViewProps) {
  const [chefName, setChefName] = useState("Chef");
  useEffect(() => {
    try {
      const n = localStorage.getItem("yi_chef_name");
      if (n) setChefName(n);
    } catch {}
  }, []);

  const gordonRow = rankings.find((r) => r.isGordon);
  const gordonReturn = gordonRow?.roiPercent ?? 3.1;

  return (
    <section style={{ display: "grid", gap: 22 }} aria-labelledby="lounge-heading">

      {/* Header */}
      <div>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--yi-muted, #888)",
          margin: "0 0 6px",
        }}>
          Members&apos; room · status board · ranked Kitchens
        </p>
        <h2 id="lounge-heading" style={{
          fontFamily: "var(--font-bodoni), Georgia, serif",
          fontSize: "1.55rem",
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.08,
        }}>
          The Lounge
        </h2>
      </div>

      {/* Sicilia welcome */}
      <div style={{
        border: "1px solid var(--yi-frame, #ccc)",
        borderLeft: "2px solid var(--yi-black, #111)",
        padding: "16px 18px",
        background: "var(--yi-card-bg, #fff)",
      }}>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--yi-muted, #888)",
          margin: "0 0 10px",
        }}>
          Sicilia · The Lounge
        </p>
        <p style={{
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: "1rem",
          lineHeight: 1.62,
          color: "var(--yi-ink, #111)",
          margin: "0 0 6px",
          fontStyle: "italic",
        }}>
          &ldquo;Benvenuta, Chef {chefName}. The Kitchen feeds you. The Lounge shows you what you&apos;re cooking toward. This week — let&apos;s see who beat Gordon.&rdquo;
        </p>
      </div>

      {/* Gordon's weekly plate card */}
      <div style={{
        border: "1px solid #b42318",
        padding: "16px 18px",
        background: "var(--yi-card-bg, #fff)",
      }}>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#b42318",
          margin: "0 0 10px",
        }}>
          Gordon · This Week
        </p>
        <p style={{
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: "0.93rem",
          lineHeight: 1.58,
          color: "var(--yi-copy, #333)",
          margin: 0,
        }}>
          This week I&apos;m watching MTN. The rand is under pressure, their data revenue holds, and the market underprices their East African exposure. That&apos;s my reasoning. Beat it.
        </p>
      </div>

      {/* Beat Gordon leaderboard */}
      <div>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--yi-muted, #888)",
          margin: "0 0 10px",
        }}>
          30-day return · Beat Gordon (+{gordonReturn.toFixed(1)}% benchmark)
        </p>

        <div role="table" aria-label="Beat Gordon leaderboard" style={{ border: "1px solid var(--yi-frame, #ccc)" }}>
          {/* Header row */}
          <div role="row" style={{
            display: "grid",
            gridTemplateColumns: "44px 1fr 80px 100px",
            gap: 8,
            padding: "8px 12px",
            borderBottom: "1px solid var(--yi-hairline, #eee)",
            background: "var(--yi-soft, rgba(17,17,17,0.035))",
          }}>
            {["Rank", "Kitchen", "Return", "Status"].map((h) => (
              <span key={h} style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--yi-muted, #888)",
              }}>{h}</span>
            ))}
          </div>

          {rankings.map((row) => {
            const isGordon = row.isGordon;
            const beat = row.beatGordon;
            return (
              <div
                key={row.name}
                role="row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr 80px 100px",
                  gap: 8,
                  padding: "12px",
                  borderBottom: "1px solid var(--yi-hairline, #eee)",
                  background: isGordon
                    ? "var(--yi-black, #111)"
                    : "var(--yi-card-bg, #fff)",
                  alignItems: "center",
                  transition: "background 180ms ease",
                }}
              >
                {/* Rank */}
                <span role="cell" style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  color: isGordon ? "#fff" : "var(--yi-muted, #888)",
                }}>
                  #{row.rank}
                </span>

                {/* Name */}
                <div role="cell">
                  {isGordon ? (
                    <span style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "#fff",
                      fontWeight: 700,
                    }}>
                      GORDON
                    </span>
                  ) : (
                    <span style={{
                      fontFamily: "var(--font-archivo), system-ui, sans-serif",
                      fontSize: "0.9rem",
                      color: "var(--yi-ink, #111)",
                      fontWeight: beat ? 600 : 400,
                    }}>
                      {row.name}
                    </span>
                  )}
                  <p style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.58rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: isGordon ? "rgba(255,255,255,0.5)" : "var(--yi-muted, #888)",
                    margin: "2px 0 0",
                  }}>
                    {row.institution}
                  </p>
                </div>

                {/* Return */}
                <span role="cell" style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  color: isGordon
                    ? "#fff"
                    : row.roiPercent > 0 ? "#167a3a" : row.roiPercent < 0 ? "#b42318" : "#888",
                  fontWeight: 600,
                }}>
                  {formatPercent(row.roiPercent)}
                </span>

                {/* Status */}
                <span role="cell" style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.58rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: isGordon
                    ? "rgba(255,255,255,0.7)"
                    : beat
                    ? "#167a3a"
                    : "var(--yi-muted, #888)",
                  borderLeft: beat ? "2px solid #167a3a" : isGordon ? "2px solid rgba(255,255,255,0.3)" : "none",
                  paddingLeft: (beat || isGordon) ? 8 : 0,
                }}>
                  {isGordon ? "The Benchmark" : beat ? "Beat Gordon" : "Close — not yet"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rank ladder */}
      <div style={{
        border: "1px solid var(--yi-frame, #ccc)",
        padding: "16px",
        background: "var(--yi-card-bg, #fff)",
      }}>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--yi-muted, #888)",
          margin: "0 0 14px",
        }}>
          The rank ladder · your journey
        </p>

        <div style={{ display: "grid", gap: 0 }}>
          {RANK_LADDER.map((r, i) => {
            const isActive = i === 0;
            return (
              <div key={r.label} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 0",
                borderBottom: i < RANK_LADDER.length - 1 ? "1px solid var(--yi-hairline, #eee)" : "none",
              }}>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.62rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--yi-muted, #aaa)",
                  width: 22,
                  flexShrink: 0,
                }}>
                  0{i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: 0,
                    color: isActive ? "var(--yi-ink, #111)" : "var(--yi-muted, #aaa)",
                    fontWeight: isActive ? 700 : 400,
                  }}>
                    {r.label}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-archivo), system-ui, sans-serif",
                    fontSize: "0.8rem",
                    color: "var(--yi-muted, #aaa)",
                    margin: "2px 0 0",
                  }}>
                    {r.note}
                  </p>
                </div>
                {isActive && (
                  <span style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.58rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    border: "1px solid var(--yi-black, #111)",
                    padding: "4px 8px",
                    color: "var(--yi-ink, #111)",
                    flexShrink: 0,
                  }}>
                    You · Rank {chefName ? chefName.charAt(0).toUpperCase() : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: "0.58rem",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--yi-muted, #aaa)",
        margin: 0,
      }}>
        Educational simulation · Mock performance only · Not financial advice
      </p>
    </section>
  );
}
