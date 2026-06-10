"use client";

/**
 * Academy completion moment.
 *
 * When a Chef clears the Academy, Gordon acknowledges HOW WELL they cooked (based on
 * their real academy_score — no fake), then Sicilia steps in and welcomes them to the
 * Lounge, where they now "live": meet chefs, form Kitchens, refer a friend.
 *
 * Two beats, paced with the typewriter for the alive feel. MOCK_MVP_PAPER_TRADING_ONLY.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Maximize2, Minimize2, X } from "lucide-react";
import { useTypewriter } from "@/lib/useTypewriter";
import { press, success, tap } from "@/lib/haptics";

interface Props {
  chefName: string;
  /** Best Academy practice score, 0–100. */
  score: number;
  lessonsPassed: number;
  onEnterLounge: () => void;
  onClose: () => void;
}

function gordonGrade(name: string, score: number, lessonsPassed: number): { tier: string; line: string } {
  if (score >= 95) {
    return { tier: "Head Chef energy", line: `Magnifico, Chef ${name}. ${score}/100. You didn't just pass — you cooked. I don't say this often, so hear it: that was clean. The Lounge is going to know your name.` };
  }
  if (score >= 80) {
    return { tier: "Strong hands", line: `Strong work, Chef ${name}. ${score}/100. You earned this clearance, no cap. You read the risk, you respected the rules. Now the real cooking starts.` };
  }
  if (score >= 60) {
    return { tier: "Cleared", line: `You cleared it, Chef ${name}. ${score}/100. Solid — not flashy, but solid, and solid lasts. Keep sharpening. The Kitchen's open to you now.` };
  }
  if (score > 0) {
    return { tier: "Cleared the classes", line: `You cleared every class, Chef ${name} — that's ${lessonsPassed} lessons down. Your practice score's still warming up at ${score}/100, so keep cooking it. But you're in.` };
  }
  return { tier: "Cleared the classes", line: `You cleared every class, Chef ${name} — all ${lessonsPassed} of them. You haven't logged a practice score yet; hit "Submit Practice Attempt" in Follow the Money when you're ready for your grade. Either way — you're cleared.` };
}

function TypeLine({ text, accent, chefName, onDone }: { text: string; accent: string; chefName?: string; onDone: () => void }) {
  const [skip, setSkip] = useState(false);
  const { displayed, done } = useTypewriter(text, { speed: 16, delay: 250 });
  const isDone = skip || done;
  const activeText = skip ? text : displayed;
  const profileLabel = chefName ? `Chef ${chefName}` : "";
  const profileIndex = profileLabel ? activeText.indexOf(profileLabel) : -1;
  useEffect(() => { if (isDone) onDone(); }, [isDone, onDone]);
  return (
    <span onClick={() => { if (!isDone) { setSkip(true); tap(); } }} style={{ whiteSpace: "pre-line", cursor: isDone ? "default" : "pointer", display: "block" }}>
      {profileIndex >= 0 ? (
        <>
          {activeText.slice(0, profileIndex)}
          <Link href="/profile" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
            {profileLabel}
          </Link>
          {activeText.slice(profileIndex + profileLabel.length)}
        </>
      ) : activeText}
      {!isDone && <span style={{ display: "inline-block", width: 2, height: "1em", background: accent, marginLeft: 2, verticalAlign: "text-bottom", animation: "cursor-blink 700ms step-end infinite" }} aria-hidden />}
    </span>
  );
}

export function AcademyComplete({ chefName, score, lessonsPassed, onEnterLounge, onClose }: Props) {
  const [phase, setPhase] = useState<"gordon" | "sicilia">("gordon");
  const [typed, setTyped] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => { success(); }, []); // a little celebration buzz on open
  useEffect(() => setTyped(false), [phase]);
  useEffect(() => {
    try { setFull(localStorage.getItem("yi_full_complete") === "1"); } catch {}
  }, []);

  function toggleFull() {
    tap();
    setFull((f) => {
      const next = !f;
      try { localStorage.setItem("yi_full_complete", next ? "1" : "0"); } catch {}
      return next;
    });
  }

  const isGordon = phase === "gordon";
  const accent = isGordon ? "#b42318" : "#111";
  const grade = gordonGrade(chefName, score, lessonsPassed);
  const siciliaLine =
    `Allora, Chef ${chefName}. Benvenuta to the Lounge — this is where you live now. ` +
    `This is where chefs meet, form Kitchens, and cook together. No Kitchen yet? Refer a friend — ` +
    `two chefs is enough to start a Kitchen. That's how the best tables are built: bottom-up, organic, yours.`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Academy complete"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 400, display: "flex", alignItems: full ? "stretch" : "flex-end", justifyContent: "center" }}
    >
      <style>{`@keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes ac-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div
        style={{
          background: "var(--yi-paper)",
          color: "var(--yi-ink)",
          width: "100%",
          maxWidth: full ? "none" : 560,
          height: full ? "100%" : "auto",
          maxHeight: full ? "100%" : "92svh",
          overflowY: "auto",
          border: "1px solid var(--yi-frame)",
          borderBottom: full ? "1px solid var(--yi-frame)" : "none",
          animation: "ac-in 220ms ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--yi-hairline)", padding: "14px 20px", flexShrink: 0 }}>
          <div>
            <p style={{ ...mono, color: "#167a3a", margin: 0 }}>Academy cleared · You cooked</p>
            <p style={{ ...mono, color: "var(--yi-muted)", margin: "4px 0 0", fontSize: "0.52rem" }}>{grade.tier}</p>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <button type="button" onClick={toggleFull} aria-label={full ? "Exit full screen" : "Full screen"} title={full ? "Exit full screen" : "Full screen"} style={iconBtn}>
              {full ? <Minimize2 size={15} strokeWidth={1.8} aria-hidden /> : <Maximize2 size={15} strokeWidth={1.8} aria-hidden />}
            </button>
            <button type="button" onClick={onClose} aria-label="Close" title="Close" style={iconBtn}>
              <X size={16} strokeWidth={1.8} aria-hidden />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: "24px 22px", display: "grid", gap: 22, alignContent: "start" }}>
          <div>
            <p style={{ ...mono, color: "var(--yi-muted)", margin: "0 0 8px" }}>{isGordon ? "Gordon · Your grade" : "Sicilia · The Lounge"}</p>
            <h2 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(2rem,9vw,3.2rem)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.02em", margin: 0 }}>
              {isGordon ? "Gordon." : "Sicilia."}
            </h2>
          </div>

          <div style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 16, minHeight: 150, fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.95rem,3vw,1.05rem)", lineHeight: 1.7, color: "var(--yi-ink)" }}>
            <TypeLine key={phase} text={isGordon ? grade.line : siciliaLine} accent={accent} chefName={chefName} onDone={() => setTyped(true)} />
          </div>

          {isGordon ? (
            <button
              type="button"
              disabled={!typed}
              onClick={() => { press(); setPhase("sicilia"); }}
              style={{ ...primaryBtn, background: typed ? "var(--yi-black)" : "var(--yi-frame)", cursor: typed ? "pointer" : "default" }}
            >
              Sicilia&apos;s waiting →
            </button>
          ) : (
            <button
              type="button"
              disabled={!typed}
              onClick={() => { press(); onEnterLounge(); }}
              style={{ ...primaryBtn, background: typed ? "var(--yi-black)" : "var(--yi-frame)", cursor: typed ? "pointer" : "default" }}
            >
              Enter the Lounge →
            </button>
          )}

          <p style={{ ...mono, color: "var(--yi-muted)", margin: 0, fontSize: "0.52rem" }}>
            {typed ? "Educational simulation · No real money · Not financial advice" : "Tap the text to skip ahead"}
          </p>
        </div>
      </div>
    </div>
  );
}

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.6rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};
const iconBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  background: "transparent",
  border: "1px solid var(--yi-hairline)",
  color: "var(--yi-muted)",
  cursor: "pointer",
};
const primaryBtn: React.CSSProperties = {
  minHeight: 48,
  padding: "0 26px",
  color: "var(--yi-white)",
  border: "none",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.74rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  justifySelf: "start",
  transition: "background 280ms ease",
};
