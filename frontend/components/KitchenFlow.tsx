"use client";

/**
 * Form a Kitchen — the guided, stepped flow (like onboarding) and the Kitchen lobby.
 *
 * Two chefs is enough to start a Kitchen. You found one or join one by code; the
 * lobby shows your real table and unlocks voting once two chefs are present. Bottom-up,
 * organic communities. MOCK_MVP_PAPER_TRADING_ONLY.
 */

import { useState } from "react";
import { Check, Copy, Flame, Soup, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { press, success, tap } from "@/lib/haptics";
import { getProfileIcon } from "@/lib/profileIcons";
import {
  addPracticeChef,
  createKitchen,
  joinKitchenByCode,
  leaveKitchen,
  MIN_KITCHEN_CHEFS,
  type Governance,
  type KitchenState,
} from "@/lib/profileStore";

const mono = (rem: number, color: string): React.CSSProperties => ({
  fontFamily: "var(--font-mono), monospace",
  fontSize: `${rem}rem`,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color,
});

/* ── Form a Kitchen (create or join), guided + progress bar ── */
export function FormKitchen({ onDone }: { onDone: (k: KitchenState) => void }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [step, setStep] = useState(0); // create: 0 name, 1 governance
  const [name, setName] = useState("");
  const [governance, setGovernance] = useState<Governance>("mutual");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const totalSteps = 2;

  async function doCreate() {
    if (!user || busy) return;
    setBusy(true); setErr(null);
    try {
      const k = await createKitchen(name, governance, user);
      success();
      onDone(k);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't create the Kitchen.");
      setBusy(false);
    }
  }

  async function doJoin() {
    if (!user || busy) return;
    setBusy(true); setErr(null);
    try {
      const k = await joinKitchenByCode(code, user);
      success();
      onDone(k);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't join that Kitchen.");
      setBusy(false);
    }
  }

  // ── Choose: start or join ──
  if (mode === "choose") {
    return (
      <section style={{ display: "grid", gap: 18 }} aria-labelledby="kitchen-heading">
        <Header sub="No Kitchen yet · bottom-up" />
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0 }}>
          A Kitchen is your table. Two chefs is enough to start one — found your own as Head Chef and invite a chef you trust, or join one with a code.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          <button type="button" onClick={() => { tap(); setMode("create"); setStep(0); }} style={choiceBtn}>
            <Soup size={18} strokeWidth={1.7} aria-hidden />
            <span><b>Start a Kitchen</b><br /><span style={mono(0.55, "var(--yi-muted)")}>You become Head Chef</span></span>
          </button>
          <button type="button" onClick={() => { tap(); setMode("join"); }} style={choiceBtn}>
            <Users size={18} strokeWidth={1.7} aria-hidden />
            <span><b>Join with a code</b><br /><span style={mono(0.55, "var(--yi-muted)")}>A friend shared their Kitchen code</span></span>
          </button>
        </div>
        <Disclaimer />
      </section>
    );
  }

  // ── Join by code ──
  if (mode === "join") {
    return (
      <section style={{ display: "grid", gap: 18 }} aria-labelledby="kitchen-heading">
        <Header sub="Join a Kitchen" />
        <label style={mono(0.6, "var(--yi-muted)")} htmlFor="kcode">Kitchen code</label>
        <input
          id="kcode"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="6-character code"
          maxLength={6}
          style={{ width: "100%", border: "none", borderBottom: "2px solid var(--yi-ink)", background: "transparent", color: "var(--yi-ink)", padding: "10px 0", fontFamily: "var(--font-mono), monospace", fontSize: "1.4rem", letterSpacing: "0.2em", outline: "none", textTransform: "uppercase" }}
        />
        {err && <p style={mono(0.6, "#b42318")}>{err}</p>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={doJoin} disabled={busy || code.length < 4} style={{ ...primaryBtn, opacity: busy || code.length < 4 ? 0.45 : 1 }}>
            {busy ? "Joining…" : "Join Kitchen →"}
          </button>
          <button type="button" onClick={() => { tap(); setMode("choose"); setErr(null); }} style={ghostBtn}>Back</button>
        </div>
        <Disclaimer />
      </section>
    );
  }

  // ── Create: stepped wizard with progress bar ──
  const canNext = step === 0 ? name.trim().length > 0 : true;
  return (
    <section style={{ display: "grid", gap: 18 }} aria-labelledby="kitchen-heading">
      {/* Progress bar — the repeatable guided pattern */}
      <div style={{ height: 3, background: "var(--yi-hairline)" }}>
        <div style={{ height: "100%", background: "var(--yi-ink)", width: `${((step + 1) / totalSteps) * 100}%`, transition: "width 300ms ease" }} />
      </div>
      <Header sub={`Start a Kitchen · ${String(step + 1).padStart(2, "0")} / ${String(totalSteps).padStart(2, "0")}`} />

      {step === 0 && (
        <>
          <label style={mono(0.6, "var(--yi-muted)")} htmlFor="kname">Name your Kitchen</label>
          <input
            id="kname"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rhodes Alpha Kitchen"
            maxLength={48}
            style={{ width: "100%", border: "none", borderBottom: "2px solid var(--yi-ink)", background: "transparent", color: "var(--yi-ink)", padding: "10px 0", fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.5rem", outline: "none" }}
          />
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.85rem", color: "var(--yi-muted)", margin: 0 }}>
            Make it yours. You can cook under it for a long time.
          </p>
        </>
      )}

      {step === 1 && (
        <>
          <label style={mono(0.6, "var(--yi-muted)")} htmlFor="kgov">Governance model</label>
          <select
            id="kgov"
            value={governance}
            onChange={(e) => setGovernance(e.target.value as Governance)}
            style={{ width: "100%", padding: "12px 10px", border: "1px solid var(--yi-frame)", background: "transparent", color: "var(--yi-ink)", fontFamily: "var(--font-mono), monospace", fontSize: "0.85rem", minHeight: 48 }}
          >
            <option value="mutual">Mutual Kitchen — slow cook, long game, one chef one vote</option>
            <option value="hedge">Hedge Kitchen — high heat, sharper bets, hard exits</option>
          </select>
          <div style={{ borderLeft: "2px solid var(--yi-ink)", paddingLeft: 12 }}>
            <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0 }}>
              {governance === "mutual" ? <Soup size={15} aria-hidden /> : <Flame size={15} aria-hidden />}
              {governance === "mutual"
                ? "Patient and diversified. Everyone's vote is equal. The slow braise."
                : "Tactical and disciplined. Bolder bets, strict stop-losses. The high sear."}
            </p>
          </div>
        </>
      )}

      {err && <p style={mono(0.6, "#b42318")}>{err}</p>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {step < totalSteps - 1 ? (
          <button type="button" onClick={() => { press(); setStep((s) => s + 1); }} disabled={!canNext} style={{ ...primaryBtn, opacity: canNext ? 1 : 0.45 }}>
            Continue →
          </button>
        ) : (
          <button type="button" onClick={doCreate} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Forming…" : "Form my Kitchen →"}
          </button>
        )}
        <button
          type="button"
          onClick={() => { tap(); if (step === 0) { setMode("choose"); } else { setStep((s) => s - 1); } setErr(null); }}
          style={ghostBtn}
        >
          Back
        </button>
      </div>
      <Disclaimer />
    </section>
  );
}

/* ── Kitchen lobby: your real table ── */
export function KitchenLobby({
  kitchen,
  onChanged,
  onLeft,
}: {
  kitchen: KitchenState;
  onChanged: (k: KitchenState) => void;
  onLeft: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const ready = kitchen.members.length >= MIN_KITCHEN_CHEFS;
  const needed = Math.max(0, MIN_KITCHEN_CHEFS - kitchen.members.length);
  const local = !isSupabaseConfigured();

  function copyInvite() {
    tap();
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
    const text = `Join my Kitchen on Young Investors — code ${kitchen.joinCode}. Two chefs is enough to start cooking. ${site}/join`;
    if (nav?.share) nav.share({ title: "Join my Kitchen", text }).catch(() => {});
    else if (nav?.clipboard) nav.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }).catch(() => {});
  }

  async function addPractice() {
    if (busy) return;
    setBusy(true);
    try { onChanged(await addPracticeChef()); tap(); } catch { /* ignore */ } finally { setBusy(false); }
  }

  // Leaving is destructive (you need a code to come back) — require a second tap.
  function requestLeave() {
    tap();
    setConfirmLeave(true);
    setTimeout(() => setConfirmLeave(false), 4000);
  }

  async function leave() {
    if (busy) return;
    setBusy(true);
    try { await leaveKitchen(); onLeft(); } finally { setBusy(false); }
  }

  return (
    <section style={{ display: "grid", gap: 18 }} aria-labelledby="kitchen-heading">
      <div>
        <p style={mono(0.62, "var(--yi-muted)")}>Your Kitchen · {kitchen.governance === "hedge" ? "High heat" : "Slow cook"}</p>
        <h2 id="kitchen-heading" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.4rem,5.5vw,1.9rem)", fontWeight: 700, margin: "4px 0 0", lineHeight: 1.05 }}>
          {kitchen.name}
        </h2>
      </div>

      {/* Status */}
      <div style={{ border: `1px solid ${ready ? "#167a3a" : "var(--yi-frame)"}`, padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <p style={mono(0.62, ready ? "#167a3a" : "#b46918")}>
          {ready ? "Kitchen is ready to cook" : `Waiting — ${needed} more chef${needed !== 1 ? "s" : ""} to start`}
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: "8px 0 0" }}>
          {ready
            ? "Two chefs at the table — the 60% Rule can run. Propose a recipe and vote together."
            : "A Kitchen needs at least two chefs before anything cooks. Share your code to bring one in."}
        </p>
      </div>

      {/* Members */}
      <div>
        <p style={{ ...mono(0.55, "var(--yi-muted)"), margin: "0 0 8px" }}>The table · {kitchen.members.length} chef{kitchen.members.length !== 1 ? "s" : ""}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
          {kitchen.members.map((m) => {
            const Icon = getProfileIcon(m.icon);
            return (
              <div key={m.userId} style={{ border: "1px solid var(--yi-frame)", padding: "12px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: m.isYou ? "var(--yi-soft)" : "var(--yi-card-bg)" }}>
                <Icon size={22} strokeWidth={1.6} aria-hidden />
                <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.82rem", fontWeight: m.isYou ? 700 : 400, color: "var(--yi-ink)", textAlign: "center" }}>
                  {m.alias}{m.isYou ? " (You)" : ""}
                </span>
                <span style={mono(0.46, m.role === "founder" ? "#167a3a" : "var(--yi-muted)")}>
                  {m.simulated ? "practice" : m.role === "founder" ? "Head Chef" : "Chef"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite code */}
      <div style={{ border: "1px solid var(--yi-frame)", padding: "14px 16px", background: "var(--yi-card-bg)" }}>
        <p style={{ ...mono(0.55, "var(--yi-muted)"), margin: "0 0 8px" }}>Invite code · share to add a chef</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.2em", color: "var(--yi-ink)" }}>{kitchen.joinCode}</span>
          <button type="button" onClick={copyInvite} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 6 }}>
            {copied ? <Check size={14} strokeWidth={1.8} aria-hidden /> : <Copy size={14} strokeWidth={1.8} aria-hidden />}
            {copied ? "Copied" : "Invite"}
          </button>
        </div>
      </div>

      {/* Local-only practice chef */}
      {local && !ready && (
        <button type="button" onClick={addPractice} disabled={busy} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 8, justifySelf: "start" }}>
          <UserPlus size={15} strokeWidth={1.8} aria-hidden /> Add a practice chef (local demo)
        </button>
      )}

      {confirmLeave ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button type="button" onClick={leave} disabled={busy} style={{ ...mono(0.55, "#b42318"), background: "transparent", border: "1px solid #b42318", padding: "8px 14px", cursor: "pointer", minHeight: 40 }}>
            {busy ? "Leaving…" : "Yes, leave the Kitchen"}
          </button>
          <span style={mono(0.5, "var(--yi-muted)")}>You&apos;ll need a code to return</span>
        </div>
      ) : (
        <button type="button" onClick={requestLeave} disabled={busy} style={{ ...mono(0.55, "var(--yi-muted)"), background: "transparent", border: "none", textDecoration: "underline", cursor: "pointer", justifySelf: "start", padding: 0 }}>
          Leave this Kitchen
        </button>
      )}

      <p style={mono(0.55, "var(--yi-muted)")}>Kitchen votes are mock governance signals · No live execution</p>
    </section>
  );
}

/* ── shared bits ── */
function Header({ sub }: { sub: string }) {
  return (
    <div>
      <p style={mono(0.62, "var(--yi-muted)")}>{sub}</p>
      <h2 id="kitchen-heading" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.25rem,5vw,1.55rem)", fontWeight: 600, margin: "4px 0 0", lineHeight: 1.08 }}>
        The Kitchen
      </h2>
    </div>
  );
}
function Disclaimer() {
  return <p style={mono(0.55, "var(--yi-muted)")}>Educational simulation · No real money · Not financial advice</p>;
}

const choiceBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, textAlign: "left",
  border: "1px solid var(--yi-frame)", background: "var(--yi-card-bg)", color: "var(--yi-ink)",
  padding: "16px 16px", cursor: "pointer", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.95rem", minHeight: 64,
};
const primaryBtn: React.CSSProperties = {
  minHeight: 48, padding: "0 24px", background: "var(--yi-black)", color: "var(--yi-white)", border: "none",
  fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  minHeight: 44, padding: "0 18px", background: "transparent", color: "var(--yi-ink)", border: "1px solid var(--yi-frame)",
  fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
};
