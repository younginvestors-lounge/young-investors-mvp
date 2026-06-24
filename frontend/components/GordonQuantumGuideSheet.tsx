"use client";

import { useState } from "react";
import { computeGordonGuide, saveGordonGuide, type GordonGuideResult } from "@/lib/profileStore";
import { tap, success } from "@/lib/haptics";
import {
  GORDON_QUANTUM_DIAGNOSTIC,
  WEALTH_CREATION_FORMULA,
  type GordonQuantumKey,
} from "@/lib/wealthCreationAcademy";

type HexagramTab = "academy" | "kitchen" | "vault" | "lounge";

interface GordonQuantumGuideSheetProps {
  onClose: () => void;
  onNavigate?: (tab: HexagramTab) => void;
}

const BAND_DESTINATION: Record<string, { tab: HexagramTab; label: string; node: string }> = {
  "Empty Pot":       { tab: "academy",  label: "Start Sicilia Lesson 1 →",     node: "Academy · Follow The Mind" },
  "Leaking Pot":     { tab: "academy",  label: "Open the Academy →",            node: "Academy · Follow The Money" },
  "Simmering Pot":   { tab: "vault",    label: "Build your proof board →",      node: "Vault" },
  "Flavour Building":{ tab: "kitchen",  label: "Explain a decision at the table →", node: "Kitchen" },
  "Wealth Converter":{ tab: "lounge",   label: "Mentor others in the Lounge →", node: "Lounge" },
};

const BAND_COLORS: Record<string, string> = {
  "Empty Pot": "#b42318",
  "Leaking Pot": "#b46918",
  "Simmering Pot": "#b46918",
  "Flavour Building": "#167a3a",
  "Wealth Converter": "#167a3a",
};

const quantumLabels: Record<GordonQuantumKey, string> = {
  purpose: "Purpose",
  intellect: "Intellect",
  force: "Force",
  output: "Output",
};

export function GordonQuantumGuideSheet({ onClose, onNavigate }: GordonQuantumGuideSheetProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GordonGuideResult | null>(null);

  const totalQ = GORDON_QUANTUM_DIAGNOSTIC.length;
  const currentQ = GORDON_QUANTUM_DIAGNOSTIC[step - 1];
  const progress = step === 0 ? 0 : Math.round((step / totalQ) * 100);
  const bandColor = result ? (BAND_COLORS[result.band] ?? "#111") : "#111";

  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono), monospace",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };

  function handleAnswer(option: string) {
    if (!currentQ) return;
    tap();
    const next = { ...answers, [currentQ.id]: option };
    setAnswers(next);
    if (step < totalQ) {
      setStep(step + 1);
      return;
    }

    const res = computeGordonGuide(next);
    setResult(res);
    saveGordonGuide(res).catch(() => {});
    success();
    setStep(totalQ + 1);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 500,
          margin: "0 auto",
          background: "var(--yi-white)",
          border: "1px solid var(--yi-frame)",
          borderBottom: "none",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90svh",
          animation: "modal-in 220ms ease",
        }}
      >
        <style>{`@keyframes modal-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
          <div>
            <p style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", margin: 0 }}>
              Gordon&apos;s Guide · Four-Quanta Diagnostic
            </p>
            <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1rem", fontWeight: 600, color: "var(--yi-ink)", margin: "3px 0 0", lineHeight: 1.1 }}>
              {step === 0 ? "What Is Your Wealth State?" : step > totalQ ? result?.band ?? "" : `${currentQ?.quantum ?? "Question"} · ${step} of ${totalQ}`}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid var(--yi-frame)", padding: "6px 12px", ...mono, fontSize: "0.6rem", cursor: "pointer", color: "var(--yi-ink)" }}>
            Close
          </button>
        </div>

        {step > 0 && step <= totalQ && (
          <div style={{ height: 3, background: "var(--yi-hairline)", flexShrink: 0 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--yi-black)", transition: "width 300ms ease" }} />
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "grid", gap: 18, alignContent: "start" }}>
          {step === 0 && (
            <>
              <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 12 }}>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.65, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  &ldquo;Is your pot gaining flavour or losing flavour? I am checking Purpose, Intellect, Force, and Output. No theatre. Just the state of the meal.&rdquo;
                </p>
                <p style={{ ...mono, fontSize: "0.55rem", color: "#b42318", margin: "8px 0 0" }}>
                  Gordon · Your Guide
                </p>
              </div>

              <div style={{ border: "1px solid var(--yi-frame)", padding: "14px", display: "grid", gap: 8 }}>
                {["4 quantum questions", WEALTH_CREATION_FORMULA, "Score = total quanta / 20 x 100", "Educational diagnostic only"].map((item) => (
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

          {step > 0 && step <= totalQ && currentQ && (
            <>
              <div>
                <p style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", margin: "0 0 8px" }}>
                  {currentQ.quantum} · score /5
                </p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.98rem", fontWeight: 500, color: "var(--yi-ink)", lineHeight: 1.55, margin: 0 }}>
                  {currentQ.question}
                </p>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleAnswer(opt.label)}
                    style={{
                      textAlign: "left",
                      padding: "13px 14px",
                      border: "1px solid var(--yi-frame)",
                      background: "transparent",
                      fontFamily: "var(--font-archivo), system-ui, sans-serif",
                      fontSize: "0.88rem",
                      color: "var(--yi-ink)",
                      cursor: "pointer",
                    }}
                  >
                    <span>{opt.label}</span>
                    <span style={{ display: "block", ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", marginTop: 5 }}>
                      {opt.seasoning}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step > totalQ && result && (
            <>
              <div style={{ border: `1px solid ${bandColor}`, padding: "16px" }}>
                <p style={{ ...mono, fontSize: "0.56rem", color: bandColor, margin: "0 0 6px" }}>
                  Wealth State
                </p>
                <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.55rem", fontWeight: 600, color: bandColor, margin: "0 0 4px", lineHeight: 1.1 }}>
                  {result.band}
                </p>
                <p style={{ ...mono, fontSize: "0.62rem", color: "var(--yi-muted)", margin: 0 }}>
                  Gordon Score: {result.score}/100
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", border: "1px solid var(--yi-frame)" }}>
                {(Object.entries(result.quantumScores) as Array<[GordonQuantumKey, number]>).map(([key, value], index) => (
                  <div key={key} style={{ padding: "10px 12px", borderTop: index > 1 ? "1px solid var(--yi-hairline)" : "none", borderLeft: index % 2 === 1 ? "1px solid var(--yi-hairline)" : "none" }}>
                    <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: "0 0 4px" }}>
                      {quantumLabels[key]}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.1rem", fontWeight: 700, color: "var(--yi-ink)", margin: 0 }}>
                      {value}/5
                    </p>
                  </div>
                ))}
              </div>

              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0 }}>
                {result.bandDescription}
              </p>

              <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 12 }}>
                <p style={{ ...mono, fontSize: "0.55rem", color: "#b42318", margin: "0 0 5px" }}>Gordon · Next action</p>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.86rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0, fontStyle: "italic" }}>
                  &ldquo;{result.nextAction}&rdquo;
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(() => {
                  const dest = BAND_DESTINATION[result.band];
                  return dest && onNavigate ? (
                    <button
                      type="button"
                      onClick={() => { onNavigate(dest.tab); onClose(); }}
                      style={{ minHeight: 44, padding: "0 20px", background: "var(--yi-black)", color: "var(--yi-white)", border: "none", ...mono, fontSize: "0.65rem", cursor: "pointer" }}
                    >
                      {dest.label}
                    </button>
                  ) : null;
                })()}
                <button
                  type="button"
                  onClick={onClose}
                  style={{ minHeight: 44, padding: "0 20px", background: "transparent", color: "var(--yi-ink)", border: "1px solid var(--yi-frame)", ...mono, fontSize: "0.65rem", cursor: "pointer" }}
                >
                  Close guide
                </button>
              </div>
              {(() => {
                const dest = BAND_DESTINATION[result.band];
                return dest ? (
                  <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: 0 }}>
                    Hexagram destination · {dest.node}
                  </p>
                ) : null;
              })()}
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
