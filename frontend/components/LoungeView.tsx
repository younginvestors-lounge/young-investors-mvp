"use client";

import { useEffect, useState } from "react";
import { useTypewriter } from "@/lib/useTypewriter";
import type { RankingRow } from "@/lib/types";
import { formatPercent } from "@/lib/domain";

interface LoungeViewProps {
  rankings: RankingRow[];
}

const RANK_LADDER = [
  { rank: "01", label: "Commis",          note: "First steps in the Kitchen",           requirement: "Complete any Academy module" },
  { rank: "02", label: "Chef de Partie",  note: "You know your station",                 requirement: "Earn Kitchen clearance" },
  { rank: "03", label: "Sous Chef",       note: "Ready to lead a section",               requirement: "Beat Gordon 3 times" },
  { rank: "04", label: "Chef de Cuisine", note: "The Kitchen is yours",                  requirement: "Beat Gordon across a full month" },
  { rank: "05", label: "Michelin Star",   note: "The Lounge remembers you",              requirement: "Win a full season against Gordon" },
];

const BEAT_GORDON_PLATE = {
  week: "Week 22 · 2026",
  instrument: "MTN.JO",
  companyName: "MTN Group",
  gordonThesis: "The rand is under pressure, their data revenue holds, and the market underprices their East African exposure. That's my reasoning. Beat it.",
  gordonReturn: 3.1,
  gordonRiskNote: "I'm watching FX exposure and the Nigeria operation specifically. Currency volatility is the wild card. My position is measured. Is yours?",
};

const LIFESTYLE_QUESTIONS = [
  "Describe the life you want in five years. Specifically. What does the morning look like?",
  "What would R500,000 in a Kitchen unlock for you? Be honest, not modest.",
  "If your Kitchen beats Gordon for a full month — what does that prove about you?",
];

function SiciliaPanel({ name, gordonReturn, beatCount }: { name: string; gordonReturn: number; beatCount: number }) {
  const beatText = beatCount >= 2
    ? `Allora, Chef ${name}. The week is over. The Lounge has spoken. Two Kitchens beat Gordon this week — they voted with discipline, executed without panic, and let the process do its work. Note that. The Lounge remembers everything.`
    : `Benvenuta, Chef ${name}. The Kitchen feeds you. The Lounge shows you what you're cooking toward. Gordon's benchmark sits at +${gordonReturn.toFixed(1)}% this week. The question isn't how he did it — the question is whether you're ready to beat it.`;

  const { displayed, done } = useTypewriter(beatText, { speed: 17, delay: 300 });
  return (
    <p style={{
      fontFamily: "var(--font-archivo), system-ui, sans-serif",
      fontSize: "clamp(0.88rem, 3vw, 1rem)",
      lineHeight: 1.68,
      color: "var(--yi-ink)",
      margin: 0,
      fontStyle: "italic",
      wordBreak: "break-word",
    }}>
      {displayed}
      {!done && (
        <span style={{ display: "inline-block", width: 2, height: "1em", background: "var(--yi-ink)", marginLeft: 2, verticalAlign: "text-bottom", animation: "cursor-blink 700ms step-end infinite" }} aria-hidden />
      )}
    </p>
  );
}

function RankCard({ row, gordonReturn }: { row: RankingRow; gordonReturn: number }) {
  const isGordon = row.isGordon;
  const beat = row.beatGordon;
  const delta = row.roiPercent - gordonReturn;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "36px minmax(0,1fr) 64px minmax(72px,auto)",
      gap: 6,
      padding: "11px 12px",
      borderBottom: "1px solid var(--yi-hairline)",
      background: isGordon ? "var(--yi-black)" : "var(--yi-card-bg)",
      alignItems: "center",
      minWidth: 0,
    }}>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.68rem,2.5vw,0.82rem)", color: isGordon ? "#fff" : "var(--yi-muted)", minWidth: 0 }}>
        #{row.rank}
      </span>
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <p style={{
          fontFamily: isGordon ? "var(--font-mono), monospace" : "var(--font-archivo), system-ui, sans-serif",
          fontSize: isGordon ? "clamp(0.62rem,2.5vw,0.75rem)" : "clamp(0.78rem,3vw,0.9rem)",
          fontWeight: isGordon ? 700 : beat ? 600 : 400,
          textTransform: isGordon ? "uppercase" : "none",
          letterSpacing: isGordon ? "0.12em" : 0,
          color: isGordon ? "#fff" : "var(--yi-ink)",
          margin: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {isGordon ? "GORDON" : row.name}
        </p>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.46rem,1.5vw,0.56rem)", textTransform: "uppercase", letterSpacing: "0.08em", color: isGordon ? "rgba(255,255,255,0.5)" : "var(--yi-muted)", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {row.institution}
        </p>
      </div>
      <div style={{ textAlign: "right", minWidth: 0 }}>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.7rem,2.5vw,0.85rem)", fontWeight: 600, color: isGordon ? "#fff" : row.roiPercent > 0 ? "#167a3a" : row.roiPercent < 0 ? "#b42318" : "#888", display: "block" }}>
          {formatPercent(row.roiPercent)}
        </span>
        {!isGordon && (
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.44rem,1.4vw,0.52rem)", color: delta > 0 ? "#167a3a" : "#b42318", display: "block", marginTop: 1 }}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}% vs G
          </span>
        )}
      </div>
      <span style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: "clamp(0.46rem,1.6vw,0.58rem)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: isGordon ? "rgba(255,255,255,0.7)" : beat ? "#167a3a" : "var(--yi-muted)",
        borderLeft: beat ? "2px solid #167a3a" : isGordon ? "2px solid rgba(255,255,255,0.3)" : "none",
        paddingLeft: (beat || isGordon) ? 6 : 0,
        minWidth: 0,
        lineHeight: 1.3,
      }}>
        {isGordon ? "Benchmark" : beat ? "Beat Gordon" : "Chasing"}
      </span>
    </div>
  );
}

export function LoungeView({ rankings }: LoungeViewProps) {
  const [chefName, setChefName] = useState("Chef");
  const [userRank] = useState(0); // index in rank ladder (0 = Commis)
  const [lifestyleIdx, setLifestyleIdx] = useState(0);

  useEffect(() => {
    try {
      const n = localStorage.getItem("yi_chef_name");
      if (n) setChefName(n);
    } catch {}
  }, []);

  const gordonRow = rankings.find((r) => r.isGordon);
  const gordonReturn = gordonRow?.roiPercent ?? 3.1;
  const beatCount = rankings.filter((r) => r.beatGordon).length;

  return (
    <section style={{ display: "grid", gap: 20 }} aria-labelledby="lounge-heading">
      <style>{`@keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      {/* Header */}
      <div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: "0 0 6px" }}>
          Members&apos; room · status board · ranked Kitchens
        </p>
        <h2 id="lounge-heading" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.3rem,5vw,1.55rem)", fontWeight: 600, margin: 0, lineHeight: 1.08 }}>
          The Lounge
        </h2>
      </div>

      {/* Sicilia welcome */}
      <div style={{ border: "1px solid var(--yi-frame)", borderLeft: "2px solid var(--yi-black)", padding: "16px 18px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.6rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: "0 0 10px" }}>
          Sicilia · The Lounge
        </p>
        <SiciliaPanel name={chefName} gordonReturn={gordonReturn} beatCount={beatCount} />
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: "10px 0 0" }}>
          Lifestyle context only · Educational · Not financial advice
        </p>
      </div>

      {/* Gordon weekly plate */}
      <div style={{ border: "1px solid #b42318", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.6rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "#b42318", margin: 0 }}>
            Gordon · This Week&apos;s Plate
          </p>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", border: "1px solid var(--yi-frame)", padding: "3px 7px" }}>
            {BEAT_GORDON_PLATE.week}
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1, margin: "0 0 2px", color: "var(--yi-ink)" }}>
          {BEAT_GORDON_PLATE.instrument}
        </p>
        <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1rem", fontWeight: 600, margin: "0 0 10px", color: "var(--yi-ink)" }}>
          {BEAT_GORDON_PLATE.companyName}
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.85rem,3vw,0.93rem)", lineHeight: 1.6, color: "var(--yi-copy)", margin: "0 0 10px", wordBreak: "break-word" }}>
          &ldquo;{BEAT_GORDON_PLATE.gordonThesis}&rdquo;
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)" }}>
            Gordon&apos;s return:
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.9rem", fontWeight: 700, color: "#167a3a" }}>
            +{gordonReturn.toFixed(1)}%
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)" }}>
            to beat
          </span>
        </div>
      </div>

      {/* Beat Gordon leaderboard */}
      <div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 10px" }}>
          30-day return · Beat Gordon benchmark · {beatCount} Kitchen{beatCount !== 1 ? "s" : ""} ahead this week
        </p>

        <div role="table" aria-label="Beat Gordon leaderboard" style={{ border: "1px solid var(--yi-frame)", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div role="row" style={{ display: "grid", gridTemplateColumns: "36px minmax(0,1fr) 64px minmax(72px,auto)", gap: 6, padding: "8px 12px", borderBottom: "1px solid var(--yi-hairline)", background: "var(--yi-soft)", minWidth: 0 }}>
            {["#", "Kitchen", "Return", "Status"].map((h) => (
              <span key={h} role="columnheader" style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.48rem,1.5vw,0.58rem)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", minWidth: 0 }}>{h}</span>
            ))}
          </div>
          {rankings.map((row) => (
            <RankCard key={row.name} row={row} gordonReturn={gordonReturn} />
          ))}
        </div>
      </div>

      {/* Sicilia lifestyle card */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "16px 18px", background: "var(--yi-card-bg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.6rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: 0 }}>
            Sicilia · Lifestyle Reflection
          </p>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", border: "1px solid var(--yi-frame)", padding: "3px 7px" }}>
            Monthly check-in
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1rem,4vw,1.25rem)", fontWeight: 600, lineHeight: 1.3, color: "var(--yi-ink)", margin: "0 0 14px", fontStyle: "italic" }}>
          &ldquo;{LIFESTYLE_QUESTIONS[lifestyleIdx]}&rdquo;
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.85rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: "0 0 14px" }}>
          The Kitchen feeds you. The Lounge shows you what you&apos;re cooking toward. Your Vault is the proof. Design a lifestyle you can will — thereafter, design one that will make you a winner.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {LIFESTYLE_QUESTIONS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLifestyleIdx(i)}
              style={{ width: 20, height: 4, border: "none", background: lifestyleIdx === i ? "var(--yi-black)" : "var(--yi-frame)", cursor: "pointer", padding: 0, transition: "background 200ms ease" }}
              aria-label={`Reflection ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Earned badges */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 14px" }}>
          Your kitchen shelf · Earned tonight
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {[
            { id: "first-service", name: "First Service", desc: "Started your first Kitchen" },
            { id: "risk-cleared", name: "Risk Cleared", desc: "Completed Academy clearance" },
            { id: "seasoned", name: "Seasoned Recipe", desc: "Cast a reasoned vote" },
            { id: "great-night", name: "Great Night", desc: "Kitchen voted 60% consensus" },
          ].map((badge) => (
            <div key={badge.id} style={{ border: "1px solid var(--yi-frame)", padding: "10px 12px", textAlign: "center", background: "var(--yi-paper)" }}>
              <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-ink)", margin: "0 0 4px" }}>
                {badge.name}
              </p>
              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.65rem", color: "var(--yi-muted)", margin: 0, lineHeight: 1.3 }}>
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Rank ladder */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 14px" }}>
          The rank ladder · Commis → Michelin Star
        </p>
        {RANK_LADDER.map((r, i) => {
          const isActive = i === userRank;
          const isPast = i < userRank;
          return (
            <div key={r.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < RANK_LADDER.length - 1 ? "1px solid var(--yi-hairline)" : "none", minWidth: 0 }}>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: isPast ? "#167a3a" : isActive ? "var(--yi-ink)" : "var(--yi-muted)", width: 22, flexShrink: 0, fontWeight: isActive ? 700 : 400 }}>
                {r.rank}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.62rem,2.5vw,0.75rem)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, color: isPast ? "#167a3a" : isActive ? "var(--yi-ink)" : "var(--yi-muted)", fontWeight: isActive ? 700 : 400 }}>
                  {r.label}
                </p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.72rem,2.5vw,0.8rem)", color: "var(--yi-muted)", margin: "2px 0 0" }}>
                  {r.note}
                </p>
                {isActive && (
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: "4px 0 0" }}>
                    Next: {r.requirement}
                  </p>
                )}
              </div>
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                {isPast && (
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#167a3a", border: "1px solid #167a3a", padding: "3px 7px" }}>Done</span>
                )}
                {isActive && (
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--yi-black)", padding: "3px 7px", color: "var(--yi-ink)" }}>You</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* The shared creed */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "16px 18px", background: "var(--yi-card-bg)", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(0.95rem,3.5vw,1.15rem)", fontWeight: 600, fontStyle: "italic", color: "var(--yi-ink)", margin: "0 0 8px", lineHeight: 1.4 }}>
          &ldquo;Too many cooks do not burn the pot — they make it better.&rdquo;
        </p>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: 0 }}>
          Gordon &amp; Sicilia · The Young Investors creed
        </p>
      </div>

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.46rem,1.6vw,0.58rem)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
        Educational simulation · Mock performance only · Not financial advice
      </p>
    </section>
  );
}
