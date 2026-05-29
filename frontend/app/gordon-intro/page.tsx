"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTypewriter } from "@/lib/useTypewriter";

const VOCAB_CARDS = [
  { title: "Recipe",        body: "A trade. A plan with reasons, not a wish. Every meal starts with one." },
  { title: "Mise en place", body: "Your prep. You learn before you cook. Skip it and you get burned." },
  { title: "The 60% Rule",  body: "The Kitchen votes. 60% must agree before we cook. We decide together." },
  { title: "The Vault",     body: "Your menu. What you own, how it's doing. Know your kitchen." },
  { title: "Clearance",     body: "Your badge. Earn it in the Academy, and the Kitchen opens. Earn your way to the pass." },
];

function buildGordonSpeech(name: string, intent: string, age: number): string {
  const greeting =
    age < 18 ? `Sawubona, young Chef ${name}.` :
    age > 40 ? `Good to have you here, Chef ${name}.` :
    `Sawubona, Chef ${name}.`;

  const intentLine =
    intent === "Learn the craft"
      ? `You said you're here to learn the craft. Good. That's the right reason. The chefs who come in wanting to learn are the ones who end up cooking circles around everyone else.`
      : intent === "Build my portfolio"
      ? `You said you're here to build your portfolio. Honest answer. But here's what I need you to understand — you can't build it properly until you can read the ingredients. That's what we fix first.`
      : intent === "Start a Kitchen"
      ? `You want to start a Kitchen. Ambitious. I respect it. But a Kitchen without a trained chef is just a room full of guesses. We build the chef before we build the Kitchen.`
      : `You're here. That's already more than most people do.`;

  const close =
    age < 18
      ? `I'm going to teach you to cook before you touch the Kitchen. Most people your age were never taught how markets work — that's not your fault. But it is your problem to fix.\n\nSharp sharp. Let's start.`
      : `I'll be straight with you. The Kitchen has standards, and I need to know you're ready before you touch it. That's not an insult — it's the respect the craft deserves.\n\nSharp sharp. Let's cook.`;

  return `${greeting}\n\n${intentLine}\n\n${close}`;
}

/* ── Typewriter paragraph component ── */
function TypeParagraph({ text, speed = 18, delay = 0, onDone }: {
  text: string; speed?: number; delay?: number; onDone?: () => void;
}) {
  const { displayed, done } = useTypewriter(text, { speed, delay });
  useEffect(() => { if (done && onDone) onDone(); }, [done, onDone]);

  return (
    <span style={{ whiteSpace: "pre-line" }}>
      {displayed}
      {!done && (
        <span style={{
          display: "inline-block",
          width: 2,
          height: "1em",
          background: "#b42318",
          marginLeft: 2,
          verticalAlign: "text-bottom",
          animation: "cursor-blink 700ms step-end infinite",
        }} aria-hidden />
      )}
    </span>
  );
}

export default function GordonIntroPage() {
  const router = useRouter();
  const [chefName, setChefName] = useState("Chef");
  const [chefIntent, setChefIntent] = useState("");
  const [chefAge, setChefAge] = useState(22);
  const [phase, setPhase] = useState<"intro" | "vocab">("intro");
  const [cardIdx, setCardIdx] = useState(0);
  const [speechDone, setSpeechDone] = useState(false);
  const [vocabKey, setVocabKey] = useState(0);

  useEffect(() => {
    try {
      const n = localStorage.getItem("yi_chef_name");
      if (n) setChefName(n);
      const a = localStorage.getItem("yi_chef_age");
      if (a) setChefAge(Number(a) || 22);
      const i = localStorage.getItem("yi_chef_intent");
      if (i) setChefIntent(i);
      const seen = localStorage.getItem("yi_gordon_intro_seen");
      if (seen) router.replace("/kitchen");
    } catch {}
  }, [router]);

  function handleIntroNext() {
    setPhase("vocab");
  }

  function handleVocabNext() {
    if (cardIdx < VOCAB_CARDS.length - 1) {
      setCardIdx((i) => i + 1);
      setVocabKey((k) => k + 1);
    } else {
      try { localStorage.setItem("yi_gordon_intro_seen", "1"); } catch {}
      router.push("/academy");
    }
  }

  const card = VOCAB_CARDS[cardIdx];
  const isLast = cardIdx === VOCAB_CARDS.length - 1;
  const speech = buildGordonSpeech(chefName, chefIntent, chefAge);

  if (phase === "intro") {
    return (
      <main style={{
        minHeight: "100svh",
        background: "#fff",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        padding: "0 0 env(safe-area-inset-bottom, 24px)",
      }}>
        <style>{`
          @keyframes cursor-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>

        <div style={{ height: 2, background: "#111", flexShrink: 0 }} />

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "20px 24px 0",
        }}>
          <span style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(0.95rem,3vw,1.1rem)", fontWeight: 700 }}>
            Young Investors
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888" }}>
            Your Head Chef
          </span>
        </div>

        <div style={{ flex: 1, padding: "clamp(28px,6vw,48px) 24px 32px", maxWidth: 560 }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", margin: "0 0 8px" }}>
            Your Head Chef
          </p>

          <h1 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(2.4rem,10vw,4.2rem)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.02em", margin: "0 0 28px" }}>
            Gordon.
          </h1>

          <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 18, marginBottom: 32, minHeight: 120 }}>
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.9rem,3vw,1rem)", lineHeight: 1.68, color: "#111", margin: 0 }}>
              <TypeParagraph text={speech} speed={14} delay={400} onDone={() => setSpeechDone(true)} />
            </p>
          </div>

          <button
            type="button"
            onClick={handleIntroNext}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "13px 28px", background: speechDone ? "#111" : "#ccc",
              color: "#fff", border: "none",
              fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem",
              textTransform: "uppercase", letterSpacing: "0.12em", cursor: speechDone ? "pointer" : "default",
              transition: "background 300ms ease",
              minHeight: 48, minWidth: 140,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Continue →
          </button>

          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#bbb", margin: "20px 0 0" }}>
            Educational guidance only · Not financial advice
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100svh",
      background: "#fff",
      color: "#111",
      display: "flex",
      flexDirection: "column",
      padding: "0 0 env(safe-area-inset-bottom, 24px)",
    }}>
      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <div style={{ height: 2, background: "#eee", flexShrink: 0 }}>
        <div style={{ height: "100%", background: "#111", width: `${((cardIdx + 1) / VOCAB_CARDS.length) * 100}%`, transition: "width 300ms ease" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "20px 24px 0" }}>
        <span style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(0.95rem,3vw,1.1rem)", fontWeight: 700 }}>Young Investors</span>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.65rem)", letterSpacing: "0.1em", color: "#888" }}>
          {String(cardIdx + 1).padStart(2, "0")} / {String(VOCAB_CARDS.length).padStart(2, "0")}
        </span>
      </div>

      <div style={{ flex: 1, padding: "clamp(28px,6vw,48px) 24px 32px", maxWidth: 560, display: "flex", flexDirection: "column" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(0.55rem,2vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", margin: "0 0 12px" }}>
          Gordon&apos;s kitchen glossary
        </p>

        <h2 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.9rem,8vw,3.4rem)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
          {card.title}
        </h2>

        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.95rem,3vw,1.08rem)", lineHeight: 1.65, color: "#333", margin: "0 0 36px", minHeight: 72 }}>
          <TypeParagraph key={vocabKey} text={card.body} speed={20} delay={100} />
        </p>

        <button
          type="button"
          onClick={handleVocabNext}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "13px 28px", background: "#111", color: "#fff", border: "none",
            fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem",
            textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer",
            alignSelf: "flex-start", minHeight: 48,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {isLast ? "Enter the Academy →" : "Next →"}
        </button>

        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#bbb", margin: "16px 0 0" }}>
          Tap to continue
        </p>
      </div>
    </main>
  );
}
