"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Soup, Users, Vote } from "lucide-react";
import { getProfileIcon } from "@/lib/profileIcons";
import { useTypewriter } from "@/lib/useTypewriter";
import { useAuth } from "@/lib/auth-context";
import { FormKitchen, KitchenLobby } from "@/components/KitchenFlow";
import { KitchenChatPanel } from "@/components/KitchenChatPanel";
import { RevealBox } from "@/components/RevealBox";
import { getActiveProposal, getKitchenVotes, getMyKitchen, MIN_KITCHEN_CHEFS, submitProposal, type KitchenState, type ProposalData } from "@/lib/profileStore";
import { calculateConsensus, dynamicQuorum } from "@/lib/domain";
import { rememberGordonChefReason } from "@/lib/gordonKnowledgeBank";
import { readShelfReceipts, removeShelfReceipt, SHELF_EVENT, type ShelfReceipt } from "@/lib/shelfStore";
import type { AcademyClearance, ChefVote, KitchenMember, VoteTally } from "@/lib/types";

type GovernanceModel = "slow-cook" | "high-heat";
type KitchenPhase = "browse" | "propose" | "vote";

interface ProposalDraft {
  shelfReceiptId: string;
  symbol: string;
  assetName: string;
  side: "BUY" | "SELL";
  units: string;
  reason: string;
  riskAck: boolean;
}

const BLANK_DRAFT: ProposalDraft = {
  shelfReceiptId: "",
  symbol: "",
  assetName: "",
  side: "BUY",
  units: "",
  reason: "",
  riskAck: false,
};

const BASE_MEMBERS: Omit<KitchenMember, "name">[] = [
  { id: "jen",    vote: "FOR",     isUser: false, profileIcon: "🧑‍🍳", clearanceLevel: "Master Chef",     recipesProposed: 7 },
  { id: "sizwe",  vote: "FOR",     isUser: false, profileIcon: "👨‍💼", clearanceLevel: "Controlled Cook",  recipesProposed: 4 },
  { id: "siya",   vote: "AGAINST", isUser: false, profileIcon: "👩‍🎓", clearanceLevel: "Simmering Base",   recipesProposed: 2 },
  { id: "tshidi", vote: null,      isUser: false, profileIcon: "🧑‍💻", clearanceLevel: "Leaking Pot",      recipesProposed: 1 },
  { id: "user",   vote: null,      isUser: true,  profileIcon: "⭐",  clearanceLevel: "Controlled Cook",  recipesProposed: 3 },
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
    // YES votes needed = ceil(60% × kitchen size). Scales with the table.
    quorumRequired: dynamicQuorum(members.length),
    totalMembers:  members.length,
  };
}

// Fallback demo proposal used in local mode (no Supabase) or when no DB proposal exists.
const DEMO_PROPOSAL: ProposalData = {
  id: "proposal-npn-demo",
  kitchenId: "demo",
  proposerId: "demo",
  ticker: "NPN.JO",
  assetName: "Naspers Limited",
  side: "BUY",
  units: 50,
  thesis: "Buy 50 units of Naspers at market. Tencent discount thesis — trades below sum-of-parts. ~28% of book.",
  seasoning: "Naspers trades at a 35% discount to its Tencent stake alone. The rest of the business — OLX, PayU, Takealot — is free at current prices. This is structural, not cyclical. The catalyst is the Prosus cross-holding unwind. We season this plate small and patient.",
  status: "voting",
  createdAt: new Date().toISOString(),
};

function gordonNoteForProposal(p: ProposalData): string {
  const upperTicker = p.ticker.toUpperCase();
  if (upperTicker.includes("NPN") || upperTicker.includes("PRX")) {
    return `You want this much of this Kitchen in one stock? I've seen this before. I'm not stopping you — but explain to me why this is smart. "It looked good on Twitter" is not a recipe.`;
  }
  if (upperTicker.includes("MTN")) {
    return `MTN is a story of execution risk — regulatory, currency, operations across twelve markets. This is a thesis that needs patience and a clean exit plan, not just hope.`;
  }
  if (upperTicker.includes("SOL")) {
    return `Sasol's thesis lives and dies on the oil price and the rand. Understand your exposure before the Kitchen votes. A bet on Sasol is a bet on macro you cannot control.`;
  }
  return `Read the seasoning carefully before you vote. A good reason makes the loss a lesson and the win a skill. A missing reason makes both random.`;
}

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
  const [saving, setSaving] = useState(false);
  const [shelf, setShelf] = useState<ShelfReceipt[]>([]);

  const reasonWords = draft.reason.trim().split(/\s+/).filter(Boolean).length;
  const reasonOk = reasonWords >= 10;
  const shelfCount = shelf.length;

  useEffect(() => {
    const load = () => setShelf(readShelfReceipts());
    load();
    window.addEventListener(SHELF_EVENT, load);
    return () => window.removeEventListener(SHELF_EVENT, load);
  }, []);

  function selectReceipt(receipt: ShelfReceipt) {
    setDraft((d) => ({
      ...d,
      shelfReceiptId: receipt.id,
      symbol: receipt.symbol,
      assetName: receipt.name,
      side: receipt.decision === "SELL" ? "SELL" : "BUY",
      units: receipt.units > 0 ? String(receipt.units) : d.units,
      reason: receipt.reason,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.shelfReceiptId) { setError("Choose an item from your Shelf first."); return; }
    if (!draft.symbol) { setError("Choose an instrument."); return; }
    if (!draft.units || isNaN(Number(draft.units)) || Number(draft.units) < 1) { setError("Enter a valid unit amount."); return; }
    if (!reasonOk) { setError("Season your recipe — explain the reason in at least 10 words. Gordon needs to read it."); return; }
    if (!draft.riskAck) { setError("Acknowledge the risk note before submitting."); return; }
    setError("");
    setSaving(true);
    try {
      // Write to DB (no-op in local demo mode — returns null)
      await submitProposal({
        ticker: draft.symbol,
        assetName: draft.assetName,
        side: draft.side,
        units: Number(draft.units),
        thesis: draft.reason,
        seasoning: draft.reason,
      });
      removeShelfReceipt(draft.shelfReceiptId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the recipe. Try again.");
      setSaving(false);
      return;
    }
    setSubmitted(true);
    setSaving(false);
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

      {/* Shelf checkout */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
          <label style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)" }}>
            The Shelf
          </label>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.1em", color: shelfCount >= 10 ? "#b46918" : "var(--yi-muted)" }}>
            {shelfCount}/10 items
          </span>
        </div>
        {shelfCount === 0 ? (
          <div style={{ border: "1px dashed var(--yi-frame)", padding: "14px", background: "var(--yi-paper)" }}>
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.86rem", color: "var(--yi-copy)", lineHeight: 1.55, margin: 0 }}>
              Your Shelf is empty. Go to Shop, long-press a stock, and send a mock receipt here before the Kitchen can vote.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: shelfCount > 4 ? "repeat(auto-fill,minmax(min(100%,150px),1fr))" : "1fr", gap: 6 }}>
            {shelf.map((receipt) => (
            <button
              key={receipt.id}
              type="button"
              onClick={() => selectReceipt(receipt)}
              style={{
                padding: "11px 10px",
                border: draft.shelfReceiptId === receipt.id ? "1px solid var(--yi-black)" : "1px solid var(--yi-frame)",
                background: draft.shelfReceiptId === receipt.id ? "var(--yi-black)" : "transparent",
                color: draft.shelfReceiptId === receipt.id ? "var(--yi-white)" : "var(--yi-ink)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                textAlign: "left",
                minHeight: 74,
              }}
            >
              {receipt.symbol}
              <br />
              <span style={{ fontSize: "0.55rem", opacity: 0.7 }}>{receipt.decision} / {receipt.weightPercent}% plate</span>
              <br />
              <span style={{ fontSize: "0.52rem", opacity: 0.62 }}>{receipt.name}</span>
            </button>
            ))}
          </div>
        )}
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: "10px 0 0", lineHeight: 1.55 }}>
          Shop item - Shelf receipt - Recipe checkout - 60% vote
        </p>
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
          <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#167a3a", margin: "8px 0 0" }}>
            <CircleCheck size={13} strokeWidth={1.8} aria-hidden />
            <span>Reason recorded — the Kitchen will read this before voting</span>
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
          disabled={saving}
          style={{
            minHeight: 48, padding: "0 24px",
            background: saving ? "var(--yi-muted)" : "var(--yi-black)", color: "var(--yi-white)",
            border: "none",
            fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem",
            textTransform: "uppercase", letterSpacing: "0.12em",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Submitting…" : "Submit Recipe →"}
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

/* ── Chef profile bottom sheet ── */
function ChefProfileSheet({
  member,
  onClose,
}: {
  member: KitchenMember;
  onClose: () => void;
}) {
  const voteColor = member.vote === "FOR" ? "#167a3a" : member.vote === "AGAINST" ? "#b42318" : "var(--yi-muted)";
  const voteLabel = member.vote === "FOR" ? "Voted For" : member.vote === "AGAINST" ? "Voted Against" : "Pending";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 120,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          background: "var(--yi-white)",
          border: "1px solid var(--yi-frame)",
          borderBottom: "none",
          padding: "24px 20px 32px",
          display: "grid",
          gap: 16,
          animation: "modal-in 200ms ease",
        }}
      >
        <style>{`@keyframes modal-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64,
            border: "1px solid var(--yi-frame)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, background: "var(--yi-soft)",
          }}>
            {(() => { const I = getProfileIcon(member.profileIcon); return <I size={28} strokeWidth={1.5} />; })()}
          </div>
          <div>
            <p style={{
              fontFamily: "var(--font-bodoni), Georgia, serif",
              fontSize: "1.35rem", fontWeight: 600, margin: 0, lineHeight: 1.1,
            }}>
              {member.isUser ? `You (${member.name})` : member.name}
            </p>
            <p style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.12em",
              color: "var(--yi-muted)", margin: "4px 0 0",
            }}>
              {member.clearanceLevel ?? "Young Investor"} · Chef
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--yi-frame)" }}>
          {[
            { label: "Recipes", value: String(member.recipesProposed ?? 0) },
            { label: "Vote", value: voteLabel },
            { label: "Status", value: member.isUser ? "You" : "Member" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "var(--yi-white)", padding: "12px 10px", textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "1rem", fontWeight: 700, margin: "0 0 3px",
                color: label === "Vote" ? voteColor : "var(--yi-ink)",
              }}>
                {value}
              </p>
              <p style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em",
                color: "var(--yi-muted)", margin: 0,
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent", border: "1px solid var(--yi-frame)",
            fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem",
            textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "10px 16px", cursor: "pointer", color: "var(--yi-ink)",
            justifySelf: "start",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ── Active proposal + vote screen ── */
function VoteScreen({
  proposal,
  members,
  onVote,
  onBack,
}: {
  proposal: ProposalData;
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

  const proposalNumber = proposal.id === "proposal-npn-demo" ? "014" : proposal.id.slice(-6).toUpperCase();

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Proposal card */}
      <RevealBox symbol={<Vote size={15} strokeWidth={1.8} aria-hidden />} title="Recipe Checkout" meta="Read the seasoning before voting" defaultOpen>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", border: "1px solid var(--yi-frame)", padding: "4px 7px" }}>
            Recipe #{proposalNumber}
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", border: "1px solid var(--yi-frame)", padding: "4px 7px" }}>
            {proposal.side}
          </span>
        </div>

        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.55rem", lineHeight: 1, margin: "0 0 4px", color: "var(--yi-ink)" }}>
          {proposal.ticker}
        </p>
        <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.18rem", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.18 }}>
          {proposal.assetName ?? proposal.ticker}
        </h3>
        {proposal.thesis && (
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", color: "var(--yi-copy)", margin: "0 0 14px", lineHeight: 1.55 }}>
            {proposal.thesis}
          </p>
        )}
      </div>
      </RevealBox>

      {/* THE SEASONING re-surface — last taste at the pass */}
      <div style={{ border: "1px solid var(--yi-frame)", borderLeft: "2px solid var(--yi-black)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-ink)", fontWeight: 700, margin: "0 0 10px" }}>
          The Seasoning · Proposer&apos;s Reason
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", lineHeight: 1.6, margin: "0 0 14px", fontStyle: "italic" }}>
          &ldquo;{proposal.seasoning}&rdquo;
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
          <GordonRiskNote text={gordonNoteForProposal(proposal)} />
        </p>
      </div>

      {/* Vote bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)" }}>
            {result.forCount} For · {result.againstCount} Against · {members.length - result.castCount} Pending
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", fontWeight: 700, color: passes ? "#167a3a" : "#b42318", letterSpacing: "0.08em" }}>
            {passes ? "PASSES" : "NOT PASSING"}
          </span>
        </div>
        <div style={{ position: "relative", height: 28, border: "1px solid var(--yi-frame)", background: "var(--yi-white)" }}>
          <div style={{ height: "100%", width: `${barWidth}%`, background: passes ? "#167a3a" : barWidth > 0 ? "#b46918" : "transparent", transition: "width 260ms ease, background 260ms ease" }} />
          <div style={{ position: "absolute", top: -5, bottom: -5, left: "60%", width: 1, background: "#111" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)" }}>
            Need {dynamicQuorum(members.length)} of {members.length}
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)" }}>60% rule</span>
        </div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: passes ? "#167a3a" : "#b46918", margin: "6px 0 0" }}>
          {passes
            ? `Kitchen is ready to cook · ${result.forCount} YES of ${dynamicQuorum(members.length)} needed`
            : `${result.forCount} YES · need ${dynamicQuorum(members.length) - result.forCount} more to cook`}
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
            Too many cooks do not burn the pot — they make it better. The table has spoken. Recipe for {proposal.ticker} is cleared.
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
  onTabChange?: (tab: import("@/lib/types").DashboardTab) => void;
}

/* ── Main KitchenView ── */
export function KitchenView({ clearance, onTabChange }: KitchenViewProps) {
  const { user, recordKitchenVote } = useAuth();
  const [model, setModel] = useState<GovernanceModel>("slow-cook");
  const [phase, setPhase] = useState<KitchenPhase>("browse");
  const [submittedDraft, setSubmittedDraft] = useState<ProposalDraft | null>(null);
  const [kitchen, setKitchen] = useState<KitchenState | null>(null);
  const [loadingKitchen, setLoadingKitchen] = useState(true);
  const [members, setMembers] = useState<KitchenMember[]>([]);
  // activeProposal: null = no open proposal, DEMO_PROPOSAL = local/fallback, or a real DB proposal
  const [activeProposal, setActiveProposal] = useState<ProposalData | null>(null);
  const [selectedMember, setSelectedMember] = useState<KitchenMember | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Load the chef's real Kitchen (Supabase RPC or local demo).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const k = await getMyKitchen(user);
        if (!cancelled) setKitchen(k);
      } catch {
        if (!cancelled) setKitchen(null);
      } finally {
        if (!cancelled) setLoadingKitchen(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Build the voting table from real members. Practice (local-demo) chefs pre-cast a
  // vote so a solo tester can see the 60% Rule; real co-chefs are pending until they vote.
  useEffect(() => {
    if (!kitchen) { setMembers([]); return; }
    setMembers(
      kitchen.members.map((m) => ({
        id: m.userId,
        name: m.isYou ? `${m.alias} (You)` : m.alias,
        vote: (m.simulated ? "FOR" : null) as ChefVote,
        isUser: m.isYou,
        profileIcon: m.icon,
        clearanceLevel: m.role === "founder" ? "Head Chef" : "Kitchen Chef",
      }))
    );
    setModel(kitchen.governance === "hedge" ? "high-heat" : "slow-cook");
    // Once kitchen is known, fetch the active proposal from the DB.
    getActiveProposal().then((p) => {
      setActiveProposal(p ?? DEMO_PROPOSAL);
    }).catch(() => {
      setActiveProposal(DEMO_PROPOSAL);
    });
  }, [kitchen]);

  // Poll every 5 s: refresh votes AND the active proposal (so user B sees user A's new recipe).
  useEffect(() => {
    if (!kitchen || kitchen.members.length < MIN_KITCHEN_CHEFS) return;
    let cancelled = false;

    async function sync() {
      // Refresh the proposal first so we always vote against the correct ticker.
      const proposal = await getActiveProposal().catch(() => null) ?? DEMO_PROPOSAL;
      if (!cancelled) setActiveProposal(proposal);

      const votes = await getKitchenVotes(proposal.ticker);
      if (cancelled || Object.keys(votes).length === 0) return;
      setMembers((prev) =>
        prev.map((m) => {
          if (m.isUser) return m;
          const v = votes[m.id];
          return v ? { ...m, vote: v as ChefVote } : m;
        })
      );
    }

    sync();
    const t = setInterval(sync, 5000);
    return () => { cancelled = true; clearInterval(t); };
  }, [kitchen]);

  function castVote(memberId: string, vote: ChefVote) {
    const member = members.find((m) => m.id === memberId);
    const next = member && member.vote === vote ? null : vote;
    setMembers((prev) => prev.map((m) => (m.id !== memberId ? m : { ...m, vote: next })));
    // Persist only the user's own cast (not an un-vote). Best-effort, never blocks.
    if (member?.isUser && next && activeProposal) {
      void recordKitchenVote({
        kitchenName: kitchen?.name ?? "My Kitchen",
        proposalId: activeProposal.id,
        proposalTicker: activeProposal.ticker,
        vote: next,
        seasoningReason: activeProposal.seasoning,
      });
    }
  }

  // Risk-literacy reminder. The product can be explored, but vote/proposal actions
  // still carry explicit mock-finance safety language.
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
            Practice mode active
          </p>
          <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.2rem,4vw,1.45rem)", fontWeight: 600, color: "var(--yi-ink)", margin: "0 0 12px", lineHeight: 1.15 }}>
            Build your Kitchen, then sharpen the recipe.
          </p>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: "0 0 16px" }}>
            You can explore the table, form your Kitchen, and understand the flow. Recipes remain educational, paper-only, and tied to Gordon&apos;s risk commentary.
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

  // ── Kitchen gate: form/join a Kitchen before cooking ──
  if (loadingKitchen) {
    return (
      <section style={{ display: "grid", gap: 16 }} aria-labelledby="kitchen-heading">
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--yi-muted)" }}>
          Loading your Kitchen…
        </p>
      </section>
    );
  }
  if (!kitchen) {
    return (
      <section style={{ display: "grid", gap: 0 }} aria-labelledby="kitchen-heading">
        <FormKitchen onDone={setKitchen} />
      </section>
    );
  }
  if (kitchen.members.length < MIN_KITCHEN_CHEFS) {
    return (
      <section style={{ display: "grid", gap: 0 }} aria-labelledby="kitchen-heading">
        <KitchenLobby kitchen={kitchen} onChanged={setKitchen} onLeft={() => setKitchen(null)} />
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
            if (user) {
              rememberGordonChefReason(user.id, {
                source: "kitchen",
                action: "recipe-proposal",
                ticker: draft.symbol,
                assetName: draft.assetName,
                side: draft.side,
                units: Number(draft.units),
                reason: draft.reason,
              });
            }
            // After submit, refresh the active proposal from DB so all members see it.
            getActiveProposal().then((p) => { if (p) setActiveProposal(p); }).catch(() => {});
            setTimeout(() => setPhase("browse"), 2000);
          }}
        />
      </section>
    );
  }

  if (phase === "vote") {
    const proposal = activeProposal ?? DEMO_PROPOSAL;
    return (
      <section style={{ display: "grid", gap: 0 }} aria-labelledby="kitchen-heading">
        <VoteScreen proposal={proposal} members={members} onVote={castVote} onBack={() => setPhase("browse")} />
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
  const floorProposal = activeProposal ?? DEMO_PROPOSAL;

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
      <RevealBox symbol={<Soup size={15} strokeWidth={1.8} aria-hidden />} title="Kitchen Identity" meta="Head Chef, model, paper-only rules" defaultOpen>
      <div style={{ border: "1px solid var(--yi-frame)", padding: "16px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.28rem", fontWeight: 600, margin: "0 0 4px" }}>{kitchen.name}</p>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 16px" }}>
          {kitchen.members.length} chef{kitchen.members.length !== 1 ? "s" : ""} · {kitchen.governance === "hedge" ? "High heat" : "Slow cook"} · paper only
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
      </RevealBox>

      {/* Chefs at the table */}
      <RevealBox symbol={<Users size={15} strokeWidth={1.8} aria-hidden />} title="Chefs At The Table" meta={`${members.length} seated`}>
      <div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 12px" }}>
          Chefs at the table · {members.length} seated
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 10 }}>
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMember(m)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 5, padding: "10px 4px",
                background: "transparent", border: "1px solid var(--yi-hairline)",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
                {(() => { const I = getProfileIcon(m.profileIcon); return <I size={22} strokeWidth={1.5} />; })()}
              </span>
              <span style={{
                fontFamily: "var(--font-archivo), system-ui, sans-serif",
                fontSize: "0.72rem", fontWeight: m.isUser ? 700 : 400,
                color: "var(--yi-ink)", whiteSpace: "nowrap", maxWidth: "100%",
                overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {m.isUser ? "You" : m.name}
              </span>
              <span style={{
                display: "inline-block", width: 7, height: 7,
                background: m.vote === "FOR" ? "#167a3a" : m.vote === "AGAINST" ? "#b42318" : "var(--yi-hairline)",
                border: "1px solid var(--yi-frame)",
              }} />
            </button>
          ))}
        </div>
      </div>
      </RevealBox>

      {/* Active recipe summary */}
      <RevealBox symbol={<Vote size={15} strokeWidth={1.8} aria-hidden />} title="Active Recipe" meta={passes ? "60% threshold passed" : "Voting open"} defaultOpen tone={passes ? "positive" : "watch"}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", border: "1px solid var(--yi-frame)", padding: "4px 7px" }}>Active Recipe</span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: passes ? "#167a3a" : "#b46918", border: `1px solid ${passes ? "#167a3a" : "#b46918"}`, padding: "4px 7px" }}>
            {passes ? "Ready to cook" : "Voting open"}
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.55rem", lineHeight: 1, margin: "0 0 4px", color: "var(--yi-ink)" }}>{floorProposal.ticker}</p>
        <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.18rem", fontWeight: 600, margin: "0 0 8px", lineHeight: 1.18 }}>{floorProposal.assetName}</h3>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", margin: "0 0 16px", lineHeight: 1.55 }}>{floorProposal.thesis}</p>

        {/* Mini vote bar */}
        <div style={{ position: "relative", height: 20, border: "1px solid var(--yi-frame)", background: "var(--yi-white)", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${result.forRatio * 100}%`, background: passes ? "#167a3a" : result.forRatio > 0 ? "#b46918" : "transparent", transition: "width 260ms ease" }} />
          <div style={{ position: "absolute", top: -4, bottom: -4, left: "60%", width: 1, background: "#111" }} />
        </div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: passes ? "#167a3a" : "#b46918", margin: "0 0 14px" }}>
          {result.forCount} for · {result.againstCount} against · need {dynamicQuorum(members.length)} of {members.length}
        </p>

        <button
          type="button"
          onClick={() => setPhase("vote")}
          style={{ minHeight: 44, padding: "0 20px", background: "var(--yi-black)", color: "var(--yi-white)", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
        >
          Vote on this recipe →
        </button>
      </div>
      </RevealBox>

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
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          style={{ minHeight: 48, padding: "0 22px", background: "transparent", color: "var(--yi-ink)", border: "1px solid var(--yi-frame)", fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}
        >
          Kitchen Chat
        </button>
      </div>

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
        Kitchen votes are mock governance signals in this demo · No live execution
      </p>

      {onTabChange && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => onTabChange("lounge")} style={{ background: "transparent", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Earn your seat in The Lounge →
          </button>
          <button type="button" onClick={() => onTabChange("vault")} style={{ background: "transparent", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Build your Vault →
          </button>
        </div>
      )}

      {selectedMember && (
        <ChefProfileSheet member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      {chatOpen && (
        <KitchenChatPanel
          kitchenName={kitchen?.name ?? "The Kitchen"}
          onClose={() => setChatOpen(false)}
        />
      )}
    </section>
  );
}
