"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const GREETINGS = [
  { word: "Hello",     lang: "English" },
  { word: "Sawubona",  lang: "isiZulu" },
  { word: "Molo",      lang: "isiXhosa" },
  { word: "Hallo",     lang: "Afrikaans" },
  { word: "Dumela",    lang: "Sesotho" },
  { word: "Thobela",   lang: "Sepedi" },
  { word: "Avuxeni",   lang: "Xitsonga" },
  { word: "Ndaa",      lang: "Tshivenda" },
  { word: "Lotjhani",  lang: "isiNdebele" },
  { word: "Dumela",    lang: "Setswana" },
  { word: "Sawubona",  lang: "siSwati" },
  { word: "Mhoro",     lang: "Shona" },
  { word: "Jambo",     lang: "Kiswahili" },
  { word: "Moni",      lang: "Chichewa" },
  { word: "Olá",       lang: "Português" },
  { word: "Bonjour",   lang: "Français" },
  { word: "Aweh",      lang: "SA Slang" },
];

export default function LoginPage() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Returning users skip straight to kitchen
  useEffect(() => {
    try {
      const name = localStorage.getItem("yi_chef_name");
      const complete = localStorage.getItem("yi_onboarding_complete");
      if (name && complete) {
        router.replace("/kitchen");
        return;
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % GREETINGS.length);
        setVisible(true);
      }, 300);
    }, 1800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const g = GREETINGS[idx];

  return (
    <main style={{
      minHeight: "100svh",
      background: "#ffffff",
      color: "#111111",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
      padding: "0",
    }}>

      {/* Top rule */}
      <div style={{ height: 2, background: "#111111", flexShrink: 0 }} />

      {/* Header strip */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "18px 24px 0",
      }}>
        <span style={{
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: "1rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#111111",
        }}>
          Young Investors
        </span>
        <span style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.56rem",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "#aaaaaa",
        }}>
          We Cook.
        </span>
      </div>

      {/* Main content */}
      <div style={{ padding: "clamp(24px,6vw,52px) 24px 32px", maxWidth: 520 }}>

        {/* Greeting carousel */}
        <div style={{ marginBottom: "clamp(20px,5vw,36px)" }}>
          <span style={{
            fontFamily: "var(--font-bodoni), Georgia, serif",
            fontSize: "clamp(3rem, 13vw, 5.2rem)",
            fontWeight: 500,
            color: "#111111",
            display: "block",
            lineHeight: 1,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(5px)",
            transition: "opacity 260ms ease, transform 260ms ease",
          }}>
            {g.word}
          </span>
          <span style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.58rem",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#bbbbbb",
            display: "block",
            marginTop: 6,
            opacity: visible ? 1 : 0,
            transition: "opacity 260ms ease",
          }}>
            {g.lang}
          </span>
        </div>

        {/* Three pillars */}
        <div style={{ borderTop: "1px solid #eeeeee", marginBottom: "clamp(24px,5vw,36px)" }}>
          {[
            { label: "The Academy",  body: "Complete modules, earn clearance, unlock the Kitchen. No shortcuts." },
            { label: "The Kitchen",  body: "Propose recipes, vote with your table, reach 60% consensus before anything cooks." },
            { label: "The Lounge",   body: "See who beat Gordon this week. Build your rank. Earn your seat." },
          ].map((item) => (
            <div key={item.label} style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr",
              gap: 12,
              padding: "12px 0",
              borderBottom: "1px solid #eeeeee",
              alignItems: "start",
            }}>
              <span style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#111111",
                fontWeight: 700,
              }}>
                {item.label}
              </span>
              <span style={{
                fontFamily: "var(--font-archivo), system-ui, sans-serif",
                fontSize: "0.86rem",
                lineHeight: 1.55,
                color: "#555555",
              }}>
                {item.body}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/onboarding"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 32px",
            border: "1px solid #111111",
            background: "#111111",
            color: "#ffffff",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            textDecoration: "none",
          }}
        >
          Start your journey →
        </Link>

        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.54rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#bbbbbb",
          margin: "14px 0 0",
          lineHeight: 1.7,
        }}>
          Paper trading only · Educational simulation · No real money · Not financial advice
        </p>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #eeeeee",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <span style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.52rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#cccccc",
        }}>
          MOCK_MVP_PAPER_TRADING_ONLY
        </span>
        <span style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.52rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#cccccc",
        }}>
          Young Investors · We Cook
        </span>
      </div>
    </main>
  );
}
