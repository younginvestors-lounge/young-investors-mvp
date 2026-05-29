"use client";

import { useEffect, useState } from "react";
import { useTypewriter } from "@/lib/useTypewriter";
import { calculateConsensus } from "@/lib/domain";
import type { AcademyClearance, ChefVote, KitchenMember, VoteTally } from "@/lib/types";

type GovernanceModel = "slow-cook" | "high-heat";
type KitchenPhase = "browse" | "propose" | "vote";

interface ProposalDraft {
  symbol: string;
  assetName: string;
  side: "BUY" | "SELL";
  units: string;
  reason: string;
  riskAck: boolean;
}

const BLANK_DRAFT: ProposalDraft = {
  symbol: "",
  assetName: "",
  side: "BUY",
  units: "",
  reason: "",
  riskAck: false,
};

const BASE_MEMBERS: Omit<KitchenMember, "name">[] = [
  { id: "jen",    vote: "FOR",     isUser: false },
  { id: "sizwe",  vote: "FOR",     isUser: false },
  { id: "siya",   vote: "AGAINST", isUser: false },
  { id: "tshidi", vote: null,      isUser: false },
  { id: "user",   vote: null,      isUser: true  },
];

const PEER_NAMES: Record<string, string> = {
  jen:    "Jen",
  sizwe:  "Sizwe",
  siya:   "Siya",
  tshidi: "Tshidi",
};

function membersToVoteTally(members: KitchenMember[]): VoteTally {
  return {
    yes:           members.filter((m) => m.vote === "FOR").length,
    no:            members.filter((m) => m.vote === "AGAINST").length,
    abstain:       members.filter((m) => m.vote === "ABSTAIN").length,
    quorumRequired: 3,
    totalMembers:  members.length,
  };
}

const ACTIVE_PROPOSAL = {
  id: "proposal-npn-live",
  number: "014",
  symbol: "NPN.JO",
  assetName: "Naspers Limited",
  side: "BUY" as const,
  units: 50,
  thesis: "Buy 50 units of Naspers at market. Tencent discount thesis — trades below sum-of-parts. ~28% of book.",
  reason: "Naspers trades at a 35% discount to its Tencent stake alone. The rest of the business — OLX, PayU, Takealot — is free at current prices. This is structural, not cyclical. The catalyst is the Prosus cross-holding unwind. We season this plate small and patient.",
  gordonNote: "You want 28% of this Kitchen in one stock? I've seen this before. I'm not stopping you — but explain to me why this is smart. \"It looked good on Twitter\" is not a recipe.",
};

const JSE_INSTRUMENTS = [
  { symbol: "NPN.JO", name: "Naspers Limited" },
  { symbol: "PRX.JO", name: "Prosus NV" },
  { symbol: "MTN.JO", name: "MTN Group" },
  { symbol: "SOL.JO", name: "Sasol Limited" },
  { symbol: "SBK.JO", name: "Standard Bank Group" },
  { symbol: "FSR.JO", name: "FirstRand" },
  { symbol: "REM.JO", name: "Remgro" },
  { symbol: "ANG.JO", name: "AngloGold Ashanti" },
];

const GOVERNANCE_NOTES: Record<GovernanceModel, string> = {
  "slow-cook": "Slow Cook · Long game. Democratic consensus, diversified plates, patient capital. Every chef votes equal.",
  "high-heat":  "High Heat · Tactical. Asymmetric strategies, shorter holds, non-negotiable exit discipline. The mandate runs hot.",
};

function GordonRiskNote({ text }: { text: string }) {
  const { displayed, done } = useTypewriter(text, { speed: 16, delay: 300 });
  return (
    <>
      <style>{`@keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      <span>
        {displayed}
        {!done && (
          <span style={{ display:"inline-block", width:2, height:"1em", background:"#b42318", marginLeft:2, verticalAlign:"text-bottom", animation:"cursor-blink 700ms step-end infinite" }} aria-hidden />
        )}
      </span>
    </>
  );
}

/* ── Propose Recipe screen ── */
function ProposeScreen({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (draft: ProposalDraft) => void;
}) {
  const [draft, setDraft] = useState<ProposalDraft>(BLANK_DRAFT);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reasonWords = draft.reason.trim().split(/\s+/).filter(Boolean).length;
  const reasonOk = reasonWords >= 10;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.symbol) { setError("Choose an instrument."); return; }
    if (!draft.units || isNaN(Number(draft.units)) || Number(draft.units) < 1) { setError("Enter a valid unit amount."); return; }
    if (!reasonOk) { setError("Season your recipe — explain the reason in at least 10 words. Gordon needs to read it."); return; }
    if (!draft.riskAck) { setError("Acknowledge the risk note before submitting."); return; }
    setError("");
    setSubmitted(true);
    setTimeout(() => onSubmit(draft), 1200);
  }

  if (submitted) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#167a3a", marginBottom: 12 }}>
          Recipe submitted · Kitchen is voting
        </p>
        <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.4rem", fontWeight: 600, color: "var(--yi-ink)", margin: "0 0 8px" }}>
          Your recipe is on the pass.
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", color: "var(--yi-copy)", lineHeight: 1.6 }}>
          The Kitchen is reading your seasoning. Gordon has noted the recipe. The table will vote.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
      <div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: "0 0 6px" }}>
          Propose a Recipe · The Kitchen Floor
        </p>
        <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.2rem,4vw,1.5rem)", fontWeight: 600, margin: 0, lineHeight: 1.08 }}>
          New Recipe
        </h3>
      </div>

      {/* Instrument picker */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <label style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", display: "block", marginBottom: 8 }}>
          Instrument
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {JSE_INSTRUMENTS.map((ins) => (
            <button
              key={ins.symbol}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, symbol: ins.symbol, assetName: ins.name }))}
              style={{
                padding: "10px 8px",
                border: draft.symbol === ins.symbol ? "1px solid var(--yi-black)" : "1px solid var(--yi-frame)",
                background: draft.symbol === ins.symbol ? "var(--yi-black)" : "transparent",
                color: draft.symbol === ins.symbol ? "var(--yi-white)" : "var(--yi-ink)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {ins.symbol}
              <br />
              <span style={{ fontSize: "0.55rem", opacity: 0.7 }}>{ins.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Side + Units */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
          <label style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", display: "block", marginBottom: 8 }}>
            Direction
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid var(--yi-frame)" }}>
            {(["BUY", "SELL"] as const).map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, side: s }))}
                style={{
                  minHeight: 40,
                  border: "none",
                  borderRight: i === 0 ? "1px solid var(--yi-frame)" : "none",
                  background: draft.side === s ? "var(--yi-black)" : "transparent",
                  color: draft.side === s ? "var(--yi-white)" : "var(--yi-ink)",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
          <label style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", display: "block", marginBottom: 8 }}>
            Units
          </label>
          <input
            type="number"
            min={1}
            value={draft.units}
            onChange={(e) => setDraft((d) => ({ ...d, units: e.target.value }))}
            placeholder="e.g. 10"
            style={{
              width: "100%",
              border: "1px solid var(--yi-frame)",
              background: "transparent",
              color: "var(--yi-ink)",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.88rem",
              padding: "10px 8px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* THE SEASONING — crucial first taste */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)", borderLeft: "2px solid var(--yi-black)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
          <label style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-ink)", fontWeight: 700 }}>
            Season your recipe
          </label>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.1em", color: reasonOk ? "#167a3a" : "var(--yi-muted)" }}>
            {reasonWords}/10 words min · {reasonOk ? "seasoned" : "needs more"}
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.82rem", color: "var(--yi-copy)", margin: "0 0 10px", lineHeight: 1.5 }}>
          Why this trade? Why now? What&apos;s the edge and what&apos;s the risk? A win you can&apos;t explain is luck. A loss you can&apos;t explain is a habit.
        </p>
        <textarea
          value={draft.reason}
          onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))}
          placeholder="Season it. Tell me the reason — Gordon"
          rows={4}
          style={{
            width: "100%",
            border: "1px solid var(--yi-frame)",
            background: "transparent",
            color: "var(--yi-ink)",
            fontFamily: "var(--font-archivo), system-ui, sans-serif",
            fontSize: "0.88rem",
            lineHeight: 1.55,
            padding: "10px 12px",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        {reasonOk && (
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#167a3a", margin: "8px 0 0" }}>
            ✓ Reason recorded — the Kitchen will read this before voting
          </p>
        )}
      </div>

      {/* Risk acknowledgement */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#b42318", margin: "0 0 10px" }}>
          Gordon · Pre-submission check
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", lineHeight: 1.55, margin: "0 0 12px" }}>
          Before this recipe leaves the pass — does your reason still hold? Is the plate sized so a wrong call won&apos;t end you? This is your last seasoning before the Kitchen votes.
        </p>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={draft.riskAck}
            onChange={(e) => setDraft((d) => ({ ...d, riskAck: e.target.checked }))}
            style={{ marginTop: 2, flexShrink: 0, accentColor: "#111" }}
          />
          <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.82rem", color: "var(--yi-ink)", lineHeight: 1.5 }}>
            My reason still holds. The plate is sized survivably. I&apos;m ready for the Kitchen to vote.
          </span>
        </label>
      </div>

      {error && (
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#b42318", margin: 0 }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="submit"
          style={{
            minHeight: 48, padding: "0 24px",
            background: "var(--yi-black)", color: "var(--yi-white)",
            border: "none",
            fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem",
            textTransform: "uppercase", letterSpacing: "0.12em",
            cursor: "pointer",
          }}
        >
          Submit Recipe →
        </button>
        <button
          type="button"
          onClick={onBack}
          style={{
            minHeight: 48, padding: "0 20px",
            background: "transparent", color: "var(--yi-ink)",
            border: "1px solid var(--yi-frame)",
            fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem",
            textTransform: "uppercase", letterSpacing: "0.12em",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
        Mock governance signal only · No live execution · Educational simulation
      </p>
    </form>
  );
}

/* ── Active proposal + vote screen ── */
function VoteScreen({
  members,
  onVote,
  onBack,
}: {
  members: KitchenMember[];
  onVote: (memberId: string, vote: ChefVote) => void;
  onBack: () => void;
}) {
  const tally = membersToVoteTally(members);
  const consensus = calculateConsensus(tally);
  const result = {
    forCount: tally.yes,
    againstCount: tally.no,
    castCount: tally.yes + tally.no + tally.abstain,
    quorumMet: consensus.quorumMet,
    forRatio: consensus.yesRatio,
    passes: consensus.approved,
  };
  const barWidth = result.forRatio * 100;
  const passes = result.passes;

  const [reasonConfirmed, setReasonConfirmed] = useState(false);
  const userMember = members.find((m) => m.isUser);
  const userHasVoted = userMember?.vote != null;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Proposal card */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "16px", background: "var(--yi-card-bg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", border: "1px solid var(--yi-frame)", padding: "4px 7px" }}>
            Recipe #{ACTIVE_PROPOSAL.number}
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", border: "1px solid var(--yi-frame)", padding: "4px 7px" }}>
            {ACTIVE_PROPOSAL.side}
          </span>
        </div>

        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.55rem", lineHeight: 1, margin: "0 0 4px", color: "var(--yi-ink)" }}>
          {ACTIVE_PROPOSAL.symbol}
        </p>
        <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.18rem", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.18 }}>
          {ACTIVE_PROPOSAL.assetName}
        </h3>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", color: "var(--yi-copy)", margin: "0 0 14px", lineHeight: 1.55 }}>
          {ACTIVE_PROPOSAL.thesis}
        </p>
      </div>

      {/* THE SEASONING re-surface — last taste at the pass */}
      <div style={{ border: "1px solid var(--yi-frame)", borderLeft: "2px solid var(--yi-black)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-ink)", fontWeight: 700, margin: "0 0 10px" }}>
          The Seasoning · Proposer&apos;s Reason
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", lineHeight: 1.6, margin: "0 0 14px", fontStyle: "italic" }}>
          &ldquo;{ACTIVE_PROPOSAL.reason}&rdquo;
        </p>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={reasonConfirmed}
            onChange={(e) => setReasonConfirmed(e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, accentColor: "#111" }}
          />
          <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.82rem", color: "var(--yi-ink)", lineHeight: 1.5 }}>
            I have read the reason. It still holds. I&apos;m ready to vote.
          </span>
        </label>
      </div>

      {/* Gordon risk note */}
      <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 14 }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#b42318", margin: "0 0 6px" }}>
          Gordon · Risk Note
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", margin: 0, lineHeight: 1.52 }}>
          <GordonRiskNote text={ACTIVE_PROPOSAL.gordonNote} />
        </p>
      </div>

      {/* Vote bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)" }}>
            {result.forCount} For · {result.againstCount} Against · {5 - result.castCount} Pending
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", fontWeight: 700, color: passes ? "#167a3a" : "#b42318", letterSpacing: "0.08em" }}>
            {passes ? "PASSES" : "NOT PASSING"}
          </span>
        </div>
        <div style={{ position: "relative", height: 28, border: "1px solid var(--yi-frame)", background: "var(--yi-white)" }}>
          <div style={{ height: "100%", width: `${barWidth}%`, background: passes ? "#167a3a" : barWidth > 0 ? "#b46918" : "transparent", transition: "width 260ms ease, background 260ms ease" }} />
          <div style={{ position: "absolute", top: -5, bottom: -5, left: "60%", width: 1, background: "#111" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)" }}>60% threshold</span>
        </div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: result.quorumMet ? "#167a3a" : "#b46918", margin: "6px 0 0" }}>
          {result.quorumMet ? `Quorum met · ${result.castCount}/5 voted` : `Quorum needed · ${result.castCount}/3 cast so far`}
        </p>
      </div>

      {/* Member votes */}
      <div style={{ border: "1px solid var(--yi-frame)", background: "var(--yi-card-bg)" }}>
        <div style={{ borderBottom: "1px solid var(--yi-hairline)", padding: "12px 16px" }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: 0 }}>
            Cast your vote · {!reasonConfirmed && !userHasVoted ? "read the seasoning first" : "table is ready"}
          </p>
        </div>
        {members.map((member) => (
          <div key={member.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid var(--yi-hairline)", gap: 10, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.82rem,3vw,0.9rem)", fontWeight: member.isUser ? 600 : 400, margin: 0, color: "var(--yi-ink)", whiteSpace: "nowrap" }}>
                {member.name}
              </p>
              {member.isUser && (
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.5rem,1.8vw,0.58rem)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: "2px 0 0" }}>
                  Your vote
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
              {member.isUser ? (
                <>
                  {(["FOR", "AGAINST", "ABSTAIN"] as ChefVote[]).map((v) => (
                    <button
                      key={v!}
                      type="button"
                      disabled={!reasonConfirmed && !userHasVoted}
                      onClick={() => onVote(member.id, v)}
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "clamp(0.55rem,2vw,0.62rem)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        padding: "0 10px",
                        border: member.vote === v
                          ? `1px solid ${v === "FOR" ? "#167a3a" : v === "AGAINST" ? "#b42318" : "#888"}`
                          : "1px solid var(--yi-frame)",
                        background: member.vote === v
                          ? v === "FOR" ? "#167a3a" : v === "AGAINST" ? "#b42318" : "#555"
                          : "transparent",
                        color: member.vote === v ? "#fff" : (!reasonConfirmed && !userHasVoted) ? "var(--yi-muted)" : "var(--yi-ink)",
                        cursor: (!reasonConfirmed && !userHasVoted) ? "not-allowed" : "pointer",
                        transition: "all 160ms ease",
                        minHeight: 44,
                        minWidth: 52,
                        opacity: (!reasonConfirmed && !userHasVoted) ? 0.5 : 1,
                      }}
                    >
                      {v === "FOR" ? "For" : v === "AGAINST" ? "Against" : "Pass"}
                    </button>
                  ))}
                </>
              ) : (
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "5px 10px", border: "1px solid", color: member.vote === "FOR" ? "#167a3a" : member.vote === "AGAINST" ? "#b42318" : "var(--yi-muted)", borderColor: member.vote === "FOR" ? "#167a3a" : member.vote === "AGAINST" ? "#b42318" : "var(--yi-frame)", minHeight: 36, display: "flex", alignItems: "center" }}>
                  {member.vote ?? "Pending"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {passes && (
        <div style={{ border: "1px solid #167a3a", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#167a3a", margin: "0 0 6px" }}>
            Kitchen is ready to cook
          </p>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", color: "var(--yi-copy)", lineHeight: 1.6, margin: 0 }}>
            Too many cooks do not burn the pot — they make it better. The table has spoken. Recipe #{ACTIVE_PROPOSAL.number} is cleared.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        style={{ alignSelf: "flex-start", background: "transparent", color: "var(--yi-ink)", border: "1px solid var(--yi-frame)", fontFamily: "var(--font-mono), monospace", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 18px", cursor: "pointer" }}
      >
        ← Kitchen Floor
      </button>

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
        Kitchen votes are mock governance signals in this demo · No live execution
      </p>
    </div>
  );
}

interface KitchenViewProps {
  clearance: AcademyClearance;
}

/* ── Main KitchenView ── */
export function KitchenView({ clearance }: KitchenViewProps) {
  const [model, setModel] = useState<GovernanceModel>("slow-cook");
  const [phase, setPhase] = useState<KitchenPhase>("browse");
  const [submittedDraft, setSubmittedDraft] = useState<ProposalDraft | null>(null);
  const [members, setMembers] = useState<KitchenMember[]>(() =>
    BASE_MEMBERS.map((m) => ({ ...m, name: m.isUser ? "You" : PEER_NAMES[m.id] ?? m.id }))
  );

  useEffect(() => {
    try {
      const n = localStorage.getItem("yi_chef_name");
      if (n) setMembers((prev) => prev.map((m) => (m.isUser ? { ...m, name: `${n} (You)` } : m)));
    } catch {}
  }, []);

  function castVote(memberId: string, vote: ChefVote) {
    setMembers((prev) => prev.map((m) => (m.id !== memberId ? m : { ...m, vote: m.vote === vote ? null : vote })));
  }

  // Clearance gate — show a locked screen before Academy is cleared
  if (!clearance.complete) {
    return (
      <section style={{ display: "grid", gap: 22 }} aria-labelledby="kitchen-heading">
        <div>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: "0 0 6px" }}>
            The Kitchen Floor
          </p>
          <h2 id="kitchen-heading" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.25rem,5vw,1.55rem)", fontWeight: 600, margin: 0, lineHeight: 1.08 }}>
            The Kitchen
          </h2>
        </div>
        <div style={{ border: "1px solid #b42318", padding: "20px 18px", background: "var(--yi-card-bg)" }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#b42318", margin: "0 0 10px" }}>
            Kitchen access locked · Learn before you earn
          </p>
          <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.2rem,4vw,1.45rem)", fontWeight: 600, color: "var(--yi-ink)", margin: "0 0 12px", lineHeight: 1.15 }}>
            Complete the required Academy modules to unlock the Kitchen.
          </p>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: "0 0 16px" }}>
            Gordon won&apos;t let an unprepared chef near the pass. You need clearance before you can propose a recipe or cast a vote. Head to the Academy — the required modules are waiting.
          </p>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: 0 }}>
            {clearance.missingModuleIds.length} required module{clearance.missingModuleIds.length !== 1 ? "s" : ""} remaining
          </p>
        </div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
          Kitchen votes are mock governance signals · No live execution
        </p>
      </section>
    );
  }

  if (phase === "propose") {
    return (
      <section style={{ display: "grid", gap: 0 }} aria-labelledby="kitchen-heading">
        <ProposeScreen
          onBack={() => setPhase("browse")}
          onSubmit={(draft) => {
            setSubmittedDraft(draft);
            setTimeout(() => setPhase("browse"), 2000);
          }}
        />
      </section>
    );
  }

  if (phase === "vote") {
    return (
      <section style={{ display: "grid", gap: 0 }} aria-labelledby="kitchen-heading">
        <VoteScreen members={members} onVote={castVote} onBack={() => setPhase("browse")} />
      </section>
    );
  }

  /* Browse / floor view */
  const tally = membersToVoteTally(members);
  const consensus = calculateConsensus(tally);
  const result = {
    forCount: tally.yes,
    againstCount: tally.no,
    castCount: tally.yes + tally.no + tally.abstain,
    quorumMet: consensus.quorumMet,
    forRatio: consensus.yesRatio,
    passes: consensus.approved,
  };
  const passes = result.passes;

  return (
    <section style={{ display: "grid", gap: 22 }} aria-labelledby="kitchen-heading">

      {/* Header */}
      <div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)", margin: "0 0 6px" }}>
          The Kitchen Floor · recipes, taste votes, table consensus
        </p>
        <h2 id="kitchen-heading" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.25rem,5vw,1.55rem)", fontWeight: 600, margin: 0, lineHeight: 1.08 }}>
          The Kitchen
        </h2>
      </div>

      {/* Kitchen meta + governance toggle */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "16px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.28rem", fontWeight: 600, margin: "0 0 4px" }}>Rhodes Test Kitchen</p>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 16px" }}>
          5 members · simulated pool R60,000
        </p>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 8px" }}>
          Governance model
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid var(--yi-frame)", maxWidth: 380, marginBottom: 12 }}>
          {(["slow-cook", "high-heat"] as GovernanceModel[]).map((m, i) => (
            <button key={m} type="button" onClick={() => setModel(m)} style={{ minHeight: 44, border: "none", borderRight: i === 0 ? "1px solid var(--yi-frame)" : "none", borderBottom: model === m ? "2px solid var(--yi-black)" : "2px solid transparent", background: model === m ? "var(--yi-white)" : "transparent", color: model === m ? "var(--yi-ink)" : "var(--yi-muted)", fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", padding: "8px 12px", transition: "all 180ms ease" }}>
              {m === "slow-cook" ? "Slow Cook" : "High Heat"}
            </button>
          ))}
        </div>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", margin: "0 0 8px", lineHeight: 1.52 }}>
          {GOVERNANCE_NOTES[model]}
        </p>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
          Educational governance template · not a licensed fund
        </p>
      </div>

      {/* Active recipe summary */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "16px", background: "var(--yi-card-bg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", border: "1px solid var(--yi-frame)", padding: "4px 7px" }}>Recipe #{ACTIVE_PROPOSAL.number}</span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: result.quorumMet && passes ? "#167a3a" : "#b46918", border: `1px solid ${result.quorumMet && passes ? "#167a3a" : "#b46918"}`, padding: "4px 7px" }}>
            {result.quorumMet && passes ? "Ready to cook" : "Voting open"}
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.55rem", lineHeight: 1, margin: "0 0 4px", color: "var(--yi-ink)" }}>{ACTIVE_PROPOSAL.symbol}</p>
        <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.18rem", fontWeight: 600, margin: "0 0 8px", lineHeight: 1.18 }}>{ACTIVE_PROPOSAL.assetName}</h3>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", margin: "0 0 16px", lineHeight: 1.55 }}>{ACTIVE_PROPOSAL.thesis}</p>

        {/* Mini vote bar */}
        <div style={{ position: "relative", height: 20, border: "1px solid var(--yi-frame)", background: "var(--yi-white)", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${result.forRatio * 100}%`, background: passes ? "#167a3a" : result.forRatio > 0 ? "#b46918" : "transparent", transition: "width 260ms ease" }} />
          <div style={{ position: "absolute", top: -4, bottom: -4, left: "60%", width: 1, background: "#111" }} />
        </div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: result.quorumMet ? "#167a3a" : "#b46918", margin: "0 0 14px" }}>
          {result.forCount} for · {result.againstCount} against · {5 - result.castCount} pending · {result.quorumMet ? "Quorum met" : "Quorum needed"}
        </p>

        <button
          type="button"
          onClick={() => setPhase("vote")}
          style={{ minHeight: 44, padding: "0 20px", background: "var(--yi-black)", color: "var(--yi-white)", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
        >
          Vote on this recipe →
        </button>
      </div>

      {submittedDraft && (
        <div style={{ border: "1px solid #167a3a", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#167a3a", margin: "0 0 6px" }}>
            Your recipe is on the pass
          </p>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", lineHeight: 1.6, margin: 0 }}>
            <strong>{submittedDraft.side} {submittedDraft.symbol}</strong> — {submittedDraft.units} units — seasoned and submitted. The Kitchen will vote.
          </p>
        </div>
      )}

      {/* CTA row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setPhase("propose")}
          style={{ minHeight: 48, padding: "0 22px", background: "transparent", color: "var(--yi-ink)", border: "1px solid var(--yi-black)", fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
        >
          + Propose a Recipe
        </button>
      </div>

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
        Kitchen votes are mock governance signals in this demo · No live execution
      </p>
    </section>
  );
}
