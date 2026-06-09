"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Check, UserPlus } from "lucide-react";
import { useTypewriter } from "@/lib/useTypewriter";
import { GlossaryBook } from "@/components/GlossaryBook";
import { LoungeMusic } from "@/components/LoungeMusic";
import { useAuth } from "@/lib/auth-context";
import { tap } from "@/lib/haptics";
import type { RankingRow } from "@/lib/types";
import { formatPercent } from "@/lib/domain";

interface LoungeViewProps {
  rankings: RankingRow[];
  onTabChange?: (tab: import("@/lib/types").DashboardTab) => void;
}

const RANK_LADDER = [
  { rank: "01", label: "Commis",          note: "First steps in the Kitchen",           requirement: "Complete any Academy module", meaning: "You have entered service. The goal is basic fluency: words, risk, and why recipes need reasons." },
  { rank: "02", label: "Chef de Partie",  note: "You know your station",                 requirement: "Earn Kitchen clearance", meaning: "You can hold a station without burning the table. Academy clearance turns learning into Kitchen access." },
  { rank: "03", label: "Sous Chef",       note: "Ready to lead a section",               requirement: "Beat Gordon 3 times", meaning: "You are not just participating. Your reasoning and votes have started beating Gordon's benchmark." },
  { rank: "04", label: "Chef de Cuisine", note: "The Kitchen is yours",                  requirement: "Beat Gordon across a full month", meaning: "You have sustained process over time. The Lounge sees consistency, not one lucky night." },
  { rank: "05", label: "Michelin Star",   note: "The Lounge remembers you",              requirement: "Win a full season against Gordon", meaning: "Season-level excellence. Status here means discipline, receipts, risk control, and results." },
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

const SICILIA_QUOTES = [
  (name: string, gordonReturn: number) => `Benvenuta, Chef ${name}. The Kitchen feeds you. The Lounge shows you what you're cooking toward. Gordon's benchmark sits at +${gordonReturn.toFixed(1)}% this week. The question is not how he did it. The question is whether your table is ready to beat it.`,
  (name: string) => `Benvenuta, Chef ${name}. Taste is not decoration here. Taste is knowing why you want the life, then building the receipts to deserve it.`,
  (name: string) => `Allora, Chef ${name}. Status is not noise. Status is proof that you can keep your head while the room gets loud.`,
  (name: string) => `Benvenuta, Chef ${name}. The Lounge does not clap for guesses. It remembers discipline, timing, and the reasons you could repeat under pressure.`,
];

function SiciliaPanel({ name, gordonReturn, beatCount, lineIndex }: { name: string; gordonReturn: number; beatCount: number; lineIndex: number }) {
  const beatText = beatCount >= 2
    ? `Allora, Chef ${name}. The week is over. The Lounge has spoken. Two Kitchens beat Gordon this week — they voted with discipline, executed without panic, and let the process do its work. Note that. The Lounge remembers everything.`
    : `Benvenuta, Chef ${name}. The Kitchen feeds you. The Lounge shows you what you're cooking toward. Gordon's benchmark sits at +${gordonReturn.toFixed(1)}% this week. The question isn't how he did it — the question is whether you're ready to beat it.`;

  const rotatedText = SICILIA_QUOTES[lineIndex % SICILIA_QUOTES.length](name, gordonReturn);
  const activeText = lineIndex === 0 ? beatText : rotatedText;
  const { displayed, done } = useTypewriter(activeText, { speed: 17, delay: 300 });
  const linkedOpener = activeText.startsWith("Allora") ? "Allora" : "Benvenuta";
  const displayPrefix = `${linkedOpener}, Chef ${name}. `;
  const displayBody = displayed.slice(Math.min(displayed.length, displayPrefix.length));
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
      {displayed.length > 0 && (
        <>
          {linkedOpener},{" "}
          <Link href="/profile" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Chef {name}
          </Link>.{" "}
          {displayBody}
        </>
      )}
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

function ReferFriendCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const refCode = user?.member_number != null ? `chef-${user.member_number}` : (user?.chef_alias || "");

  function invite() {
    tap();
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
    const url = `${site}/onboarding${refCode ? `?ref=${encodeURIComponent(refCode)}` : ""}`;
    const text = `Come cook with me on Young Investors — learn to invest, beat Gordon, and start a Kitchen. 2 chefs is enough. ${url}`;
    if (nav?.share) {
      nav.share({ title: "Young Investors · We Cook", text, url }).catch(() => {});
    } else if (nav?.clipboard) {
      nav.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {});
    }
  }

  return (
    <div style={{ border: "1px solid var(--yi-frame)", borderLeft: "2px solid var(--yi-black)", padding: "16px 18px", background: "var(--yi-card-bg)" }}>
      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.6rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: "0 0 10px" }}>
        Start a Kitchen · bottom-up
      </p>
      <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.1rem,4vw,1.35rem)", fontWeight: 600, lineHeight: 1.25, color: "var(--yi-ink)", margin: "0 0 10px" }}>
        Two chefs is enough to start a Kitchen.
      </p>
      <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: "0 0 14px" }}>
        You don&apos;t need a crowd. Bring one chef you trust, form a Kitchen, propose recipes, and vote together. That&apos;s how the best tables are built — organic, and yours.
      </p>
      <button
        type="button"
        onClick={invite}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 46, padding: "0 20px", background: "var(--yi-black)", color: "var(--yi-white)", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
      >
        {copied ? <Check size={15} strokeWidth={1.8} aria-hidden /> : <UserPlus size={15} strokeWidth={1.8} aria-hidden />}
        {copied ? "Invite copied" : "Refer a friend"}
      </button>
      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: "12px 0 0" }}>
        Kitchen forming & voting unlock next · Educational simulation
      </p>
    </div>
  );
}

export function LoungeView({ rankings, onTabChange }: LoungeViewProps) {
  const [chefName, setChefName] = useState("Chef");
  const [userRank] = useState(0); // index in rank ladder (0 = Commis)
  const [lifestyleIdx, setLifestyleIdx] = useState(0);
  const [siciliaIdx, setSiciliaIdx] = useState(0);
  const [rankMeaning, setRankMeaning] = useState<(typeof RANK_LADDER)[number] | null>(null);
  const [cookbookPrompt, setCookbookPrompt] = useState(false);
  const [cookbookOpen, setCookbookOpen] = useState(false);
  const rankPressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const n = localStorage.getItem("yi_chef_name");
      if (n) setChefName(n);
    } catch {}
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setSiciliaIdx((i) => i + 1), 11000);
    return () => window.clearInterval(timer);
  }, []);

  function clearRankPress() {
    if (rankPressTimerRef.current) {
      window.clearTimeout(rankPressTimerRef.current);
      rankPressTimerRef.current = null;
    }
  }

  function explainRank(rank: (typeof RANK_LADDER)[number]) {
    tap();
    setRankMeaning(rank);
  }

  function startRankPress(rank: (typeof RANK_LADDER)[number]) {
    clearRankPress();
    rankPressTimerRef.current = window.setTimeout(() => explainRank(rank), 430);
  }

  const gordonRow = rankings.find((r) => r.isGordon);
  const gordonReturn = gordonRow?.roiPercent ?? 3.1;
  const beatCount = rankings.filter((r) => r.beatGordon).length;

  return (
    <section style={{ display: "grid", gap: 20 }} aria-labelledby="lounge-heading">
      <style>{`@keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: "0 0 6px" }}>
            Members&apos; room · status board · ranked Kitchens
          </p>
          <h2 id="lounge-heading" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.3rem,5vw,1.55rem)", fontWeight: 600, margin: 0, lineHeight: 1.08 }}>
            The Lounge
          </h2>
        </div>
        <LoungeMusic />
      </div>

      {/* Sicilia welcome */}
      <div style={{ border: "1px solid var(--yi-frame)", borderLeft: "2px solid var(--yi-black)", padding: "16px 18px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.6rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: "0 0 10px" }}>
          Sicilia · The Lounge
        </p>
        <SiciliaPanel key={siciliaIdx} name={chefName} gordonReturn={gordonReturn} beatCount={beatCount} lineIndex={siciliaIdx} />
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

      {/* Beat Gordon leaderboard — no Kitchens have formed yet (this is the real thing) */}
      <div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,2vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 10px" }}>
          30-day return · Beat Gordon benchmark
        </p>

        <div style={{ border: "1px solid var(--yi-frame)", padding: "30px 20px", background: "var(--yi-card-bg)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.15rem,4.5vw,1.5rem)", fontWeight: 600, color: "var(--yi-ink)", margin: "0 0 8px", lineHeight: 1.2 }}>
            No Kitchens Trying to Beat Gordon Yet
          </p>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--yi-muted)", margin: "0 0 14px" }}>
            follow the money
          </p>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: "0 auto 12px", maxWidth: 360 }}>
            This is the real thing now — no fake Kitchens, no fake scores. When the first Kitchen forms and posts a 30-day return, it shows up here, chasing Gordon&apos;s +{gordonReturn.toFixed(1)}%.
          </p>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-ink)", margin: 0 }}>
            Be the first. Earn your seat. Letsss go.
          </p>
        </div>
      </div>

      {/* Start a Kitchen · refer a friend (2 chefs is enough) */}
      <ReferFriendCard />

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
                <button
                  type="button"
                  onClick={() => explainRank(r)}
                  onDoubleClick={() => { clearRankPress(); setRankMeaning(r); setCookbookPrompt(true); }}
                  onPointerDown={() => startRankPress(r)}
                  onPointerUp={clearRankPress}
                  onPointerCancel={clearRankPress}
                  onPointerLeave={clearRankPress}
                  style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.62rem,2.5vw,0.75rem)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, color: isPast ? "#167a3a" : isActive ? "var(--yi-ink)" : "var(--yi-muted)", fontWeight: isActive ? 700 : 400, background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left", textDecoration: "underline", textUnderlineOffset: 3, touchAction: "manipulation" }}
                  aria-label={`Explain ${r.label}`}
                  title="Tap for meaning. Double tap for Gordon's Cookbook."
                >
                  {r.label}
                </button>
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
        {rankMeaning && (
          <div style={{ borderTop: "1px solid var(--yi-hairline)", marginTop: 6, paddingTop: 12, display: "grid", gap: 8 }}>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: 0 }}>
              Gordon&apos;s Notebook / {rankMeaning.label}
            </p>
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0 }}>
              {rankMeaning.meaning}
            </p>
            <button
              type="button"
              onClick={() => setCookbookPrompt(true)}
              style={{ justifySelf: "start", minHeight: 34, border: "1px solid var(--yi-frame)", background: "transparent", color: "var(--yi-ink)", display: "inline-flex", alignItems: "center", gap: 7, padding: "0 10px", fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              <BookOpen size={13} strokeWidth={1.8} aria-hidden /> Read Gordon&apos;s Cookbook
            </button>
          </div>
        )}
        {cookbookPrompt && (
          <div style={{ borderTop: "1px solid var(--yi-hairline)", marginTop: 10, paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.5, color: "var(--yi-copy)", margin: 0 }}>
              Would you like to read the Cookbook in Gordon&apos;s Glossary?
            </p>
            <span style={{ display: "inline-flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => { setCookbookPrompt(false); setCookbookOpen(true); }}
                style={{ minHeight: 34, border: "none", background: "var(--yi-black)", color: "var(--yi-white)", padding: "0 11px", fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => setCookbookPrompt(false)}
                style={{ minHeight: 34, border: "1px solid var(--yi-frame)", background: "transparent", color: "var(--yi-muted)", padding: "0 11px", fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
              >
                Not now
              </button>
            </span>
          </div>
        )}
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

      {onTabChange && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => onTabChange("kitchen")} style={{ background: "transparent", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Open the Kitchen →
          </button>
          <button type="button" onClick={() => onTabChange("academy")} style={{ background: "transparent", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Back to Academy →
          </button>
        </div>
      )}

      <GlossaryBook open={cookbookOpen} onClose={() => setCookbookOpen(false)} />
    </section>
  );
}
