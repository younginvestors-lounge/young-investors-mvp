"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTypewriter } from "@/lib/useTypewriter";
import { press, tap } from "@/lib/haptics";
import { GORDON_LINES, SICILIA_LINES } from "@/lib/voice";

/** Live typewriter line. Tap to reveal instantly. Reports when finished. */
function TypeText({ text, accent, chefName, onDone }: { text: string; accent: string; chefName?: string; onDone: () => void }) {
  const [skip, setSkip] = useState(false);
  const { displayed, done } = useTypewriter(text, { speed: 16, delay: 200 });
  const isDone = skip || done;
  const shown = skip ? text : displayed;
  const profileLabel = chefName ? `Chef ${chefName}` : "";
  const profileIndex = profileLabel ? shown.indexOf(profileLabel) : -1;

  useEffect(() => {
    if (isDone) onDone();
  }, [isDone, onDone]);

  return (
    <span
      onClick={() => { if (!isDone) { setSkip(true); tap(); } }}
      style={{ whiteSpace: "pre-line", cursor: isDone ? "default" : "pointer", display: "block" }}
    >
      {profileIndex >= 0 ? (
        <>
          {shown.slice(0, profileIndex)}
          <Link href="/profile" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
            {profileLabel}
          </Link>
          {shown.slice(profileIndex + profileLabel.length)}
        </>
      ) : shown}
      {!isDone && (
        <span style={{ display: "inline-block", width: 2, height: "1em", background: accent, marginLeft: 2, verticalAlign: "text-bottom", animation: "cursor-blink 700ms step-end infinite" }} aria-hidden />
      )}
    </span>
  );
}

/** Plain-language intro to the words you'll hear everywhere. Simple + a little slang. */
const HOW_IT_WORKS = [
  { word: "Recipe", plain: "A trade — but with reasons, not a wish.", slang: "Basically a plan to buy or sell. You gotta say why." },
  { word: "The Vault", plain: "Everything you're holding, and how it's doing.", slang: "Your bag. Your menu. What you own, no cap." },
  { word: "The 60% Rule", plain: "Nothing happens until 60% of the table agrees.", slang: "Solid majority says yes first. No solo cowboys." },
  { word: "Clearance", plain: "Finish the Academy and the Kitchen opens. Learn before you earn.", slang: "Pass your classes, unlock the kitchen. Earn your seat." },
  { word: "Beat Gordon", plain: "Gordon posts a score each week. Try to beat it.", slang: "He sets the bar. You try to cook better than him. Letsss go." },
];

const INTENT_LABEL: Record<string, string> = {
  learn_craft: "learn the craft",
  build_portfolio: "build your bag",
  start_kitchen: "start a Kitchen",
};

type Phase = "gordon" | "sicilia" | "how";

export default function BriefingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>("gordon");
  const [cardIdx, setCardIdx] = useState(0);
  const [typed, setTyped] = useState(false);

  // Reset the "finished typing" gate whenever Gordon/Sicilia start a new line.
  useEffect(() => setTyped(false), [phase]);

  // Briefing needs a signed-in chef. Send guests to sign in.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/signin");
  }, [isLoading, isAuthenticated, router]);

  const name = user?.chef_alias || "Chef";
  const intent = INTENT_LABEL[user?.intent ?? ""] ?? "get cooking";

  const gordonSpeech = useMemo(
    () =>
      `${GORDON_LINES.greetingPlain}\n\n` +
      `You said you're here to ${intent}. Respect. But here's the deal, Chef ${name} — ` +
      `you can't cook with money you don't understand. So we learn first. ${GORDON_LINES.whyHard}\n\n` +
      `Do not aim for 60 just because 60 opens the Kitchen. Aim high because your score becomes your Chef Scorecard: it earns trust at the table, sharpens your reasons, and gives the Lounge something real to respect.\n\n` +
      `Sharp sharp. Let's go.`,
    [intent, name]
  );

  const siciliaSpeech = useMemo(
    () =>
      `${SICILIA_LINES.greetingPlain}\n\n` +
      `Allora, Chef ${name} — Gordon keeps your hands clean. I keep your eyes on the dream. ` +
      `The Vault, the Lounge, the life you're cooking toward. ${SICILIA_LINES.why}\n\n` +
      `Magnifico. Andiamo.`,
    [name]
  );

  function nextCard() {
    press();
    if (cardIdx < HOW_IT_WORKS.length - 1) {
      setCardIdx((i) => i + 1);
    } else {
      try { localStorage.setItem("yi_briefing_seen", "1"); } catch {}
      router.push("/academy");
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: "100svh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={mono(0.6, "#bbb")}>Young Investors</span>
      </div>
    );
  }

  // ── Gordon / Sicilia speech screens ──
  if (phase === "gordon" || phase === "sicilia") {
    const isGordon = phase === "gordon";
    const speech = isGordon ? gordonSpeech : siciliaSpeech;
    const accent = isGordon ? "#b42318" : "#111";
    return (
      <main style={shell}>
        <style>{`@keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        <div style={{ height: 2, background: "#111", flexShrink: 0 }} />
        <div style={headerRow}>
          <span style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(0.95rem,3vw,1.1rem)", fontWeight: 700 }}>
            Young Investors
          </span>
          <span style={mono(0.6, "#888")}>{isGordon ? "Your Head Chef" : "Your Lounge Host"}</span>
        </div>

        <div style={{ flex: 1, padding: "clamp(28px,6vw,48px) 24px 32px", maxWidth: 560, width: "100%" }}>
          <p style={{ ...mono(0.62, "#888"), margin: "0 0 8px" }}>{isGordon ? "Meet Gordon" : "Meet Sicilia"}</p>
          <h1 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(2.4rem,10vw,4rem)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
            {isGordon ? "Gordon." : "Sicilia."}
          </h1>

          <div style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 18, marginBottom: 30, minHeight: 150, fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.95rem,3vw,1.05rem)", lineHeight: 1.7, color: "#111" }}>
            <TypeText key={phase} text={speech} accent={accent} chefName={name} onDone={() => setTyped(true)} />
          </div>

          <button
            type="button"
            onClick={() => { press(); setPhase(isGordon ? "sicilia" : "how"); }}
            style={{ ...primaryBtn, background: typed ? "#111" : "#ccc", cursor: typed ? "pointer" : "default", transition: "background 300ms ease" }}
            disabled={!typed}
          >
            {isGordon ? "Meet Sicilia →" : "How it works →"}
          </button>

          <p style={{ ...mono(0.55, "#bbb"), margin: "20px 0 0" }}>
            {typed ? "Educational simulation · No real money · Not financial advice" : "Tap the text to skip ahead"}
          </p>
        </div>
      </main>
    );
  }

  // ── How-it-works glossary cards ──
  const card = HOW_IT_WORKS[cardIdx];
  const isLast = cardIdx === HOW_IT_WORKS.length - 1;
  return (
    <main style={shell}>
      <div style={{ height: 2, background: "#eee", flexShrink: 0 }}>
        <div style={{ height: "100%", background: "#111", width: `${((cardIdx + 1) / HOW_IT_WORKS.length) * 100}%`, transition: "width 300ms ease" }} />
      </div>
      <div style={headerRow}>
        <span style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(0.95rem,3vw,1.1rem)", fontWeight: 700 }}>Young Investors</span>
        <span style={mono(0.6, "#888")}>{String(cardIdx + 1).padStart(2, "0")} / {String(HOW_IT_WORKS.length).padStart(2, "0")}</span>
      </div>

      <div style={{ flex: 1, padding: "clamp(28px,6vw,48px) 24px 32px", maxWidth: 560, width: "100%", display: "flex", flexDirection: "column" }}>
        <p style={{ ...mono(0.62, "#888"), margin: "0 0 12px" }}>The words you&apos;ll hear · plain talk</p>
        <h2 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.9rem,8vw,3.2rem)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
          {card.word}
        </h2>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(1rem,3.2vw,1.15rem)", lineHeight: 1.55, color: "#111", margin: "0 0 14px" }}>
          {card.plain}
        </p>
        <div style={{ borderLeft: "2px solid #111", paddingLeft: 14, marginBottom: 32 }}>
          <p style={{ ...mono(0.56, "#888"), margin: "0 0 4px" }}>In plain slang</p>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.9rem,3vw,1rem)", lineHeight: 1.5, color: "#444", margin: 0 }}>
            {card.slang}
          </p>
        </div>

        <button type="button" onClick={nextCard} style={{ ...primaryBtn, alignSelf: "flex-start" }}>
          {isLast ? "Enter the Academy →" : "Next →"}
        </button>
        <p style={{ ...mono(0.55, "#bbb"), margin: "16px 0 0" }}>
          You&apos;ll get the full Gordon&apos;s Glossary before every class.
        </p>
      </div>
    </main>
  );
}

/* ── styles ── */
const shell: React.CSSProperties = {
  minHeight: "100svh",
  background: "#fff",
  color: "#111",
  display: "flex",
  flexDirection: "column",
  padding: "0 0 env(safe-area-inset-bottom, 24px)",
};
const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  padding: "20px 24px 0",
};
const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 30px",
  background: "#111",
  color: "#fff",
  border: "none",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  cursor: "pointer",
  minHeight: 48,
};
function mono(rem: number, color: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-mono), monospace",
    fontSize: `${rem}rem`,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color,
  };
}
