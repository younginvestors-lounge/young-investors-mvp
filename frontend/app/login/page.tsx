"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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
  const { isAuthenticated, isLoading } = useAuth();
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Returning, authenticated chefs skip the splash and go straight to the Kitchen.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/kitchen");
    }
  }, [isLoading, isAuthenticated, router]);

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
      background: "var(--yi-paper, #ffffff)",
      color: "var(--yi-ink, #111111)",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
      padding: "0",
    }}>

      {/* Top rule */}
      <div style={{ height: 2, background: "var(--yi-black, #111111)", flexShrink: 0 }} />

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
          color: "var(--yi-ink, #111111)",
        }}>
          Young Investors
        </span>
        <span style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.56rem",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "var(--yi-muted, #aaaaaa)",
        }}>
          We Cook.
        </span>
      </div>

      {/* Main content */}
      <div
        className="splash-grid"
        style={{ padding: "clamp(24px,6vw,52px) 24px 32px" }}
      >
        <style>{`
          .splash-grid {
            display: grid;
            grid-template-columns: minmax(0, 520px);
            gap: 28px;
            align-items: center;
            justify-content: center;
            max-width: 720px;
            width: 100%;
            margin: 0 auto;
          }
          .splash-copy {
            min-width: 0;
            display: grid;
            gap: clamp(18px, 4vw, 28px);
          }
          .login-brand-mark {
            width: clamp(112px, 24vw, 172px);
            height: auto;
            filter: invert(1);
          }
          :root[data-theme="dark"] .login-brand-mark {
            filter: none;
          }
          @media (max-width: 860px) {
            .splash-grid {
              grid-template-columns: minmax(0, 1fr);
              max-width: 560px;
            }
          }
        `}</style>
        <div className="splash-copy">
        {/* Greeting carousel */}
        <div>
          <span style={{
            fontFamily: "var(--font-bodoni), Georgia, serif",
            fontSize: "clamp(3rem, 13vw, 5.2rem)",
            fontWeight: 500,
            color: "var(--yi-ink, #111111)",
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
            color: "var(--yi-muted, #bbbbbb)",
            display: "block",
            marginTop: 6,
            opacity: visible ? 1 : 0,
            transition: "opacity 260ms ease",
          }}>
            {g.lang}
          </span>
        </div>

        {/* Three pillars */}
        <div style={{ borderTop: "1px solid var(--yi-hairline, #eeeeee)" }}>
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
              borderBottom: "1px solid var(--yi-hairline, #eeeeee)",
              alignItems: "start",
            }}>
              <span style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--yi-ink, #111111)",
                fontWeight: 700,
              }}>
                {item.label}
              </span>
              <span style={{
                fontFamily: "var(--font-archivo), system-ui, sans-serif",
                fontSize: "0.86rem",
                lineHeight: 1.55,
                color: "var(--yi-copy, #555555)",
              }}>
                {item.body}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Link
            href="/onboarding"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 32px",
              border: "1px solid var(--yi-black, #111111)",
              background: "var(--yi-black, #111111)",
              color: "var(--yi-white, #ffffff)",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              textDecoration: "none",
            }}
          >
            Start your journey →
          </Link>
          <Link
            href="/signin"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.66rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--yi-ink, #111111)",
              textDecoration: "underline",
            }}
          >
            Sign in
          </Link>
        </div>

        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.54rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--yi-muted, #bbbbbb)",
          margin: "14px 0 0",
          lineHeight: 1.7,
        }}>
          Paper trading only · Educational simulation · No real money · Not financial advice
        </p>
        </div>

      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid var(--yi-hairline, #eeeeee)",
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
          color: "var(--yi-muted, #cccccc)",
        }}>
          MOCK_MVP_PAPER_TRADING_ONLY
        </span>
        <span style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.52rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--yi-muted, #cccccc)",
        }}>
          Young Investors · We Cook
        </span>
      </div>
    </main>
  );
}
