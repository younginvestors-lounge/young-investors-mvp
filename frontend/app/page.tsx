"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  { word: "Ndeipi",    lang: "Shona (informal)" },
  { word: "Jambo",     lang: "Kiswahili" },
  { word: "Moni",      lang: "Chichewa" },
  { word: "Olá",       lang: "Português" },
  { word: "Bonjour",   lang: "Français" },
  { word: "Aweh",      lang: "SA Slang" },
];

export default function SplashPage() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % GREETINGS.length);
        setVisible(true);
      }, 300);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const g = GREETINGS[idx];

  return (
    <main style={{
      minHeight: "100svh",
      background: "#0a0a0a",
      color: "#fff",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
      padding: "40px 28px 36px",
    }}>

      {/* Top — stacked logo */}
      <div>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.35)",
          margin: "0 0 20px",
        }}>
          We Cook
        </p>
        <h1 style={{
          fontFamily: "var(--font-bodoni), Georgia, serif",
          fontWeight: 700,
          fontSize: "clamp(3.6rem, 14vw, 7rem)",
          lineHeight: 0.9,
          letterSpacing: "-0.03em",
          textTransform: "capitalize",
          color: "#fff",
          margin: 0,
        }}>
          Young<br />Investors
        </h1>
      </div>

      {/* Centre — cycling greeting */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}>
        <span style={{
          fontFamily: "var(--font-bodoni), Georgia, serif",
          fontSize: "clamp(2.4rem, 10vw, 4rem)",
          fontWeight: 500,
          color: "#fff",
          display: "block",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 280ms ease, transform 280ms ease",
        }}>
          {g.word}
        </span>
        <span style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.38)",
          marginTop: 10,
          opacity: visible ? 1 : 0,
          transition: "opacity 280ms ease",
        }}>
          {g.lang}
        </span>
      </div>

      {/* Bottom — CTA + compliance */}
      <div>
        <Link href="/login" style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.55)",
          background: "transparent",
          color: "#fff",
          padding: "13px 36px",
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          textDecoration: "none",
          marginBottom: 24,
          transition: "background 200ms ease, color 200ms ease",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#0a0a0a"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
        >
          Enter The Kitchen
        </Link>
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.58rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.25)",
          margin: 0,
          lineHeight: 1.7,
        }}>
          Educational simulation · Southern Africa · No real money · Not financial advice
        </p>
      </div>
    </main>
  );
}
