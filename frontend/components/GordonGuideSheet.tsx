"use client";

import { useState } from "react";
import { computeGordonGuide, saveGordonGuide, type GordonGuideResult } from "@/lib/profileStore";
import { tap, success } from "@/lib/haptics";

interface GordonGuideSheetProps {
  onClose: () => void;
}

const GUIDE_QUESTIONS: Array<{ id: string; question: string; options: string[] }> = [
  {
    id: "q1",
    question: "After covering all your monthly expenses, do you have money left over?",
    options: ["Yes, comfortably", "Just barely", "No"],
  },
  {
    id: "q2",
    question: "Do you have an emergency reserve you could live on for 3+ months?",
    options: ["Yes, a real reserve", "A little", "None"],
  },
  {
    id: "q3",
    question: "Over the past 12 months, how has your financial position changed?",
    options: ["Improved", "Stayed flat", "Got worse", "Swings wildly"],
  },
  {
    id: "q4",
    question: "At the end of a typical month, your income vs. spending is:",
    options: ["Surplus", "Break even", "Fall short"],
  },
  {
    id: "q5",
    question: "When making a financial decision, what do you rely on most?",
    options: ["Research & evidence", "Ask people I trust", "Gut feeling", "What's trending"],
  },
  {
    id: "q6",
    question: "After a bad financial decision, your typical response is:",
    options: ["Step back & review", "Try to win it back quickly", "Avoid the topic", "Hasn't happened yet"],
  },
  {
    id: "q7",
    question: "How would you describe your income pattern over the last year?",
    options: ["Steady & planned", "A big spike then tight", "Unpredictable"],
  },
  {
    id: "q8",
    question: "Do you have skills or assets that could generate income beyond your main job?",
    options: ["Yes, lots", "Some", "Not really"],
  },
  {
    id: "q9",
    question: "When it comes to investing or building wealth, you prefer to work:",
    options: ["With a trusted group", "Mostly alone", "Depends"],
  },
  {
    id: "q10",
    question: "How would you rate your current financial knowledge?",
    options: ["Strong", "Some basics", "Beginner"],
  },
];

const BAND_COLORS: Record<string, string> = {
  "Burn Risk": "#b42318",
  "Leaking Pot": "#b46918",
  "Simmering Base": "#b46918",
  "Controlled Cook": "#167a3a",
  "Wealth-Creative Path": "#167a3a",
  "Master Chef Mode": "#167a3a",
};

export function GordonGuideSheet({ onClose }: GordonGuideSheetProps) {
  const [step, setStep] = useState<number>(0); // 0 = intro, 1-10 = questions, 11 = result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GordonGuideResult | null>(null);

  const currentQ = GUIDE_QUESTIONS[step - 1];
  const totalQ = GUIDE_QUESTIONS.length;
  const progress = step === 0 ? 0 : Math.round((step / totalQ) * 100);

  function handleAnswer(option: string) {
    tap();
    const qId = currentQ.id;
    const next = { ...answers, [qId]: option };
    setAnswers(next);
    if (step < totalQ) {
      setStep(step + 1);
    } else {
      const res = computeGordonGuide(Object.fromEntries(
        GUIDE_QUESTIONS.map((q) => [q.id, next[q.id] ?? ""])
      ));
      setResult(res);
      saveGordonGuide(res).catch(() => {});
      success();
      setStep(totalQ + 1);
    }
  }

  const bandColor = result ? (BAND_COLORS[result.band] ?? "#111") : "#111";

  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono), monospace",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.4)",
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
          display: "flex", flexDirection: "column",
          maxHeight: "90svh",
          animation: "modal-in 220ms ease",
        }}
      >
        <style>{`@keyframes modal-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
          <div>
            <p style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", margin: 0 }}>Gordon&apos;s Guide · Baseline Diagnostic</p>
            <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1rem", fontWeight: 600, color: "var(--yi-ink)", margin: "3px 0 0", lineHeight: 1.1 }}>
              {step === 0 ? "Know Your Starting Point" : step > totalQ ? result?.band ?? "" : `Question ${step} of ${totalQ}`}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid var(--yi-frame)", padding: "6px 12px", ...mono, fontSize: "0.6rem", cursor: "pointer", color: "var(--yi-ink)" }}>
            Close
          </button>
        </div>

        {/* Progress bar (questions only) */}
        {step > 0 && step <= totalQ && (
          <div style={{ height: 3, background: "var(--yi-hairline)", flexShrink: 0 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--yi-black)", transition: "width 300ms ease" }} />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "grid", gap: 18, alignContent: "start" }}>

          {/* Intro */}
          {step === 0 && (
            <>
              <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 12 }}>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.65, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  &ldquo;Every great chef knows what they have in the fridge before they try to cook. This is your kitchen check. No right answers — just honest ones.&rdquo;
                </p>
                <p style={{ ...mono, fontSize: "0.55rem", color: "#b42318", margin: "8px 0 0" }}>Gordon · Your Guide</p>
              </div>
              <div style={{ border: "1px solid var(--yi-frame)", padding: "14px", display: "grid", gap: 8 }}>
                {["10 questions", "Takes 2 minutes", "Saved to your profile", "No judgement — just data"].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ width: 6, height: 6, background: "var(--yi-black)", flexShrink: 0, display: "inline-block" }} />
                    <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.85rem", color: "var(--yi-copy)" }}>{item}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { tap(); setStep(1); }}
                style={{ minHeight: 48, padding: "0 24px", background: "var(--yi-black)", color: "var(--yi-white)", border: "none", ...mono, fontSize: "0.68rem", cursor: "pointer" }}
              >
                Start the diagnostic →
              </button>
            </>
          )}

          {/* Questions */}
          {step > 0 && step <= totalQ && currentQ && (
            <>
              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.98rem", fontWeight: 500, color: "var(--yi-ink)", lineHeight: 1.55, margin: 0 }}>
                {currentQ.question}
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                {currentQ.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(opt)}
                    style={{
                      textAlign: "left",
                      padding: "13px 14px",
                      border: "1px solid var(--yi-frame)",
                      background: "transparent",
                      fontFamily: "var(--font-archivo), system-ui, sans-serif",
                      fontSize: "0.88rem",
                      color: "var(--yi-ink)",
                      cursor: "pointer",
                      transition: "background 120ms",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--yi-soft)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Result */}
          {step > totalQ && result && (
            <>
              <div style={{ border: `1px solid ${bandColor}`, padding: "16px" }}>
                <p style={{ ...mono, fontSize: "0.56rem", color: bandColor, margin: "0 0 6px" }}>Your Gordon&apos;s Guide Band</p>
                <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.55rem", fontWeight: 600, color: bandColor, margin: "0 0 4px", lineHeight: 1.1 }}>
                  {result.band}
                </p>
                <p style={{ ...mono, fontSize: "0.62rem", color: "var(--yi-muted)", margin: 0 }}>
                  Score: {result.score}/100
                </p>
              </div>
              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0 }}>
                {result.bandDescription}
              </p>
              <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 12 }}>
                <p style={{ ...mono, fontSize: "0.55rem", color: "#b42318", margin: "0 0 5px" }}>Gordon</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.86rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  &ldquo;This is your starting point. Not a verdict. The Kitchen is where you build from here.&rdquo;
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ minHeight: 44, padding: "0 24px", background: "var(--yi-black)", color: "var(--yi-white)", border: "none", ...mono, fontSize: "0.65rem", cursor: "pointer", justifySelf: "start" }}
              >
                Back to the Kitchen
              </button>
              <p style={{ ...mono, fontSize: "0.5rem", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
                Saved to your profile · educational diagnostic · not financial advice
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
