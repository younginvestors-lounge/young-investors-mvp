"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INTENTS = ["Learn the craft", "Build my portfolio", "Start a Kitchen"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [intent, setIntent] = useState("");

  const total = 3;

  function next() {
    if (step === 0) {
      if (!name.trim()) return;
      setStep(1);
    } else if (step === 1) {
      const n = Number(age);
      if (!age || n < 13) return;
      setStep(2);
    } else {
      if (!intent) return;
      try {
        localStorage.setItem("yi_chef_name", name.trim());
        localStorage.setItem("yi_chef_age", age);
        localStorage.setItem("yi_chef_intent", intent);
      } catch {}
      router.push("/kitchen");
    }
  }

  const ageNum = Number(age);
  const ageInvalid = age !== "" && (ageNum < 13 || isNaN(ageNum));
  const ageMinor = age !== "" && ageNum >= 13 && ageNum < 18;

  return (
    <main style={{
      minHeight: "100svh",
      background: "#fff",
      color: "#111",
      display: "flex",
      flexDirection: "column",
      padding: "0 0 40px",
    }}>

      {/* Progress bar */}
      <div style={{ height: 2, background: "#eee", flexShrink: 0 }}>
        <div style={{
          height: "100%",
          background: "#111",
          width: `${((step + 1) / total) * 100}%`,
          transition: "width 300ms ease",
        }} />
      </div>

      {/* Header row */}
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
          fontSize: "0.68rem",
          letterSpacing: "0.1em",
          color: "#888",
        }}>
          0{step + 1} / 0{total}
        </span>
      </div>

      {/* Question area */}
      <div style={{ flex: 1, padding: "48px 24px 32px", maxWidth: 520 }}>

        {step === 0 && (
          <>
            <h1 style={{
              fontFamily: "var(--font-bodoni), Georgia, serif",
              fontSize: "clamp(1.8rem, 6vw, 2.6rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              margin: "0 0 10px",
            }}>
              What should we call you, Chef?
            </h1>
            <p style={{
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
              fontSize: "0.88rem",
              color: "#888",
              margin: "0 0 32px",
            }}>
              Your kitchen alias. Make it yours.
            </p>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && next()}
              placeholder="Chef ___"
              style={{
                width: "100%",
                border: "none",
                borderBottom: "2px solid #111",
                background: "transparent",
                color: "#111",
                padding: "10px 0",
                fontFamily: "var(--font-bodoni), Georgia, serif",
                fontSize: "1.4rem",
                outline: "none",
                marginBottom: 40,
              }}
            />
          </>
        )}

        {step === 1 && (
          <>
            <h1 style={{
              fontFamily: "var(--font-bodoni), Georgia, serif",
              fontSize: "clamp(1.8rem, 6vw, 2.6rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              margin: "0 0 10px",
            }}>
              How old are you, Chef {name}?
            </h1>
            <p style={{
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
              fontSize: "0.88rem",
              color: "#888",
              margin: "0 0 32px",
            }}>
              Age determines your simulation tier.
            </p>
            <input
              autoFocus
              type="number"
              min={13}
              max={99}
              value={age}
              onChange={e => setAge(e.target.value)}
              onKeyDown={e => e.key === "Enter" && next()}
              placeholder="__"
              style={{
                width: "100%",
                border: "none",
                borderBottom: `2px solid ${ageInvalid ? "#b42318" : "#111"}`,
                background: "transparent",
                color: "#111",
                padding: "10px 0",
                fontFamily: "var(--font-bodoni), Georgia, serif",
                fontSize: "1.4rem",
                outline: "none",
                marginBottom: 12,
              }}
            />
            {ageInvalid && (
              <p style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#b42318",
                margin: "0 0 28px",
              }}>
                Minimum age 13 to enter
              </p>
            )}
            {ageMinor && !ageInvalid && (
              <p style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#888",
                margin: "0 0 28px",
              }}>
                Training kitchen · simulation only
              </p>
            )}
            {!ageInvalid && !ageMinor && age && (
              <div style={{ marginBottom: 28 }} />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{
              fontFamily: "var(--font-bodoni), Georgia, serif",
              fontSize: "clamp(1.8rem, 6vw, 2.6rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              margin: "0 0 32px",
            }}>
              What are you cooking toward, Chef?
            </h1>
            <div style={{ display: "grid", gap: 0, marginBottom: 40 }}>
              {INTENTS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIntent(opt)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "16px 18px",
                    border: "1px solid #111",
                    borderTop: "none",
                    background: intent === opt ? "#111" : "#fff",
                    color: intent === opt ? "#fff" : "#111",
                    fontFamily: "var(--font-archivo), system-ui, sans-serif",
                    fontSize: "1rem",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              ))}
              {/* top border on first item */}
              <style>{`.intent-list button:first-child { border-top: 1px solid #111; }`}</style>
            </div>
          </>
        )}

        {/* Continue button */}
        <button
          type="button"
          onClick={next}
          disabled={
            (step === 0 && !name.trim()) ||
            (step === 1 && (!age || ageNum < 13 || isNaN(ageNum))) ||
            (step === 2 && !intent)
          }
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
            opacity:
              (step === 0 && !name.trim()) ||
              (step === 1 && (!age || ageNum < 13 || isNaN(ageNum))) ||
              (step === 2 && !intent)
              ? 0.35 : 1,
            transition: "opacity 180ms ease",
          }}
        >
          Continue →
        </button>
      </div>

      <p style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: "0.58rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "#bbb",
        textAlign: "center",
        margin: 0,
        padding: "0 24px",
      }}>
        Paper trading only · No real money
      </p>
    </main>
  );
}
