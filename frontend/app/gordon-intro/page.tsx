"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const VOCAB_CARDS = [
  {
    title: "Recipe",
    body: "A trade. A plan with reasons, not a wish. Every meal starts with one.",
  },
  {
    title: "Mise en place",
    body: "Your prep. You learn before you cook. Skip it and you get burned.",
  },
  {
    title: "The 60% Rule",
    body: "The Kitchen votes. 60% must agree before we cook. We decide together.",
  },
  {
    title: "The Vault",
    body: "Your menu. What you own, how it's doing. Know your kitchen.",
  },
  {
    title: "Clearance",
    body: "Your badge. Earn it in the Academy, and the Kitchen opens. Earn your way to the pass.",
  },
];

export default function GordonIntroPage() {
  const router = useRouter();
  const [chefName, setChefName] = useState("Chef");
  const [phase, setPhase] = useState<"intro" | "vocab">("intro");
  const [cardIdx, setCardIdx] = useState(0);

  useEffect(() => {
    try {
      const n = localStorage.getItem("yi_chef_name");
      if (n) setChefName(n);

      // If already seen, skip straight to academy
      const seen = localStorage.getItem("yi_gordon_intro_seen");
      if (seen) router.replace("/academy");
    } catch {}
  }, [router]);

  function handleIntroNext() {
    setPhase("vocab");
  }

  function handleVocabNext() {
    if (cardIdx < VOCAB_CARDS.length - 1) {
      setCardIdx((i) => i + 1);
    } else {
      try {
        localStorage.setItem("yi_gordon_intro_seen", "1");
      } catch {}
      router.push("/academy");
    }
  }

  if (phase === "intro") {
    return (
      <main style={{
        minHeight: "100svh",
        background: "#fff",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        padding: "0 0 40px",
      }}>
        {/* Progress line */}
        <div style={{ height: 2, background: "#111", flexShrink: 0 }} />

        {/* Top bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "20px 24px 0",
        }}>
          <span style={{
            fontFamily: "var(--font-bodoni), Georgia, serif",
            fontSize: "1.1rem",
            fontWeight: 700,
          }}>
            Young Investors
          </span>
          <span style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#888",
          }}>
            Your Head Chef
          </span>
        </div>

        {/* Gordon panel */}
        <div style={{
          flex: 1,
          padding: "40px 24px 32px",
          maxWidth: 560,
        }}>
          <p style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#888",
            margin: "0 0 8px",
          }}>
            Your Head Chef
          </p>

          <h1 style={{
            fontFamily: "var(--font-bodoni), Georgia, serif",
            fontSize: "clamp(2.8rem, 10vw, 4.2rem)",
            fontWeight: 700,
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            margin: "0 0 32px",
          }}>
            Gordon.
          </h1>

          {/* Red-bordered Gordon panel */}
          <div style={{
            borderLeft: "2px solid #b42318",
            paddingLeft: 18,
            marginBottom: 36,
          }}>
            <p style={{
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
              fontSize: "1rem",
              lineHeight: 1.62,
              color: "#111",
              margin: 0,
              whiteSpace: "pre-line",
            }}>
              {`Sawubona, Chef ${chefName}.

I'll be straight with you. Most people your age were never taught how markets work. That's not your fault — but it is your problem to fix. That's why you're here.

I'm going to teach you to cook before you touch the Kitchen. Not because I don't trust you — because the Kitchen has standards, and I need to know you're ready.

Sharp sharp. Let's cook.`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleIntroNext}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "13px 28px",
              background: "#111",
              color: "#fff",
              border: "none",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
            }}
          >
            Continue →
          </button>

          <p style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.58rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#bbb",
            margin: "20px 0 0",
          }}>
            Educational guidance only · Not financial advice
          </p>
        </div>
      </main>
    );
  }

  // Vocab cards phase
  const card = VOCAB_CARDS[cardIdx];
  const isLast = cardIdx === VOCAB_CARDS.length - 1;

  return (
    <main style={{
      minHeight: "100svh",
      background: "#fff",
      color: "#111",
      display: "flex",
      flexDirection: "column",
      padding: "0 0 40px",
    }}>
      {/* Progress line */}
      <div style={{ height: 2, background: "#eee", flexShrink: 0 }}>
        <div style={{
          height: "100%",
          background: "#111",
          width: `${((cardIdx + 1) / VOCAB_CARDS.length) * 100}%`,
          transition: "width 300ms ease",
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "20px 24px 0",
      }}>
        <span style={{
          fontFamily: "var(--font-bodoni), Georgia, serif",
          fontSize: "1.1rem",
          fontWeight: 700,
        }}>
          Young Investors
        </span>
        <span style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          color: "#888",
        }}>
          {String(cardIdx + 1).padStart(2, "0")} / {String(VOCAB_CARDS.length).padStart(2, "0")}
        </span>
      </div>

      {/* Card content */}
      <div style={{
        flex: 1,
        padding: "48px 24px 32px",
        maxWidth: 560,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#888",
          margin: "0 0 12px",
        }}>
          Gordon&apos;s kitchen glossary
        </p>

        <h2 style={{
          fontFamily: "var(--font-bodoni), Georgia, serif",
          fontSize: "clamp(2.2rem, 8vw, 3.4rem)",
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          margin: "0 0 28px",
        }}>
          {card.title}
        </h2>

        <p style={{
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: "1.08rem",
          lineHeight: 1.62,
          color: "#333",
          margin: "0 0 40px",
        }}>
          {card.body}
        </p>

        <button
          type="button"
          onClick={handleVocabNext}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "13px 28px",
            background: "#111",
            color: "#fff",
            border: "none",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          {isLast ? "Enter the Academy →" : "Next →"}
        </button>

        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.58rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#bbb",
          margin: "20px 0 0",
        }}>
          Tap to continue
        </p>
      </div>
    </main>
  );
}
