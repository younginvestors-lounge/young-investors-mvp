"use client";

/**
 * /join — "Join The Syndicate" landing + install splash.
 *
 * Brutalist, high-contrast, Sicilia-doctrine (sharp corners, NO blur, NO shadow,
 * NO gradient). A field of charcoal triangles drifts on black; the content fades in
 * from the LEFT. "Download Now" fires the real PWA install (Add to Home Screen) so it
 * runs native-feel on devices — with a graceful iOS fallback and an "enter the app" link.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — educational simulation, no real money.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Share, Smartphone } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Deterministic pseudo-random (same on server + client → no hydration mismatch).
function rnd(seed: number): number {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}
const TRIS = Array.from({ length: 26 }, (_, i) => {
  const a = rnd(i + 1);
  const b = rnd(i + 11.3);
  const c = rnd(i + 27.7);
  return {
    top: Math.round(a * 100),
    left: Math.round(b * 100),
    size: 44 + Math.round(c * 130),
    dur: 16 + Math.round(a * 18),
    delay: -Math.round(b * 22),
    dir: c > 0.5 ? 1 : -1,
    op: 0.05 + c * 0.07,
  };
});

export default function JoinPage() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent) && !/(crios|fxios)/i.test(window.navigator.userAgent));

    function onBIP(e: Event) {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function download() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    if (isIOS) {
      setShowIosHelp(true);
      return;
    }
    // Desktop / not-yet-installable browsers: take them into the app.
    window.location.href = "/login";
  }

  const ctaLabel = installed ? "Open the app" : "Download Now";

  return (
    <main style={shell}>
      <style>{`
        @keyframes tri-drift { from { transform: translate3d(0,0,0) rotate(0deg); } to { transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--rot)); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-44px); } to { opacity: 1; transform: translateX(0); } }
        .join-rise { opacity: 0; animation: slide-in-left 620ms cubic-bezier(.16,.84,.44,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .join-tri { animation: none !important; }
          .join-rise { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* Triangle field */}
      <div aria-hidden style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, background: "#000" }}>
        {TRIS.map((t, i) => (
          <span
            key={i}
            className="join-tri"
            style={{
              position: "absolute",
              top: `${t.top}%`,
              left: `${t.left}%`,
              width: t.size,
              height: t.size,
              background: i % 3 === 0 ? "#2d2d2d" : "#1a1a1a",
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              opacity: t.op,
              ["--dx" as string]: `${t.dir * 60}px`,
              ["--dy" as string]: `${-t.dir * 40}px`,
              ["--rot" as string]: `${t.dir * 180}deg`,
              animation: `tri-drift ${t.dur}s ease-in-out ${t.delay}s infinite alternate`,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {/* Content — fades in from the left */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "0" }}>
        <div style={{ height: 2, background: "#fff", flexShrink: 0 }} />

        <div className="join-rise" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "18px 24px 0" }}>
          <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>Young Investors</span>
          <span style={mono("rgba(255,255,255,0.5)")}>We Cook.</span>
        </div>

        <div style={{ padding: "clamp(24px,6vw,52px) 24px", maxWidth: 620, width: "100%" }}>
          <p className="join-rise" style={{ ...mono("rgba(255,255,255,0.55)"), margin: "0 0 14px", animationDelay: "60ms" }}>
            Invitation · Founding Chefs
          </p>
          <h1 className="join-rise" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(2.8rem, 13vw, 5.5rem)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 22px", animationDelay: "120ms" }}>
            Join The<br />Syndicate.
          </h1>
          <p className="join-rise" style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.95rem,3.4vw,1.12rem)", lineHeight: 1.6, color: "rgba(255,255,255,0.82)", margin: "0 0 32px", maxWidth: 440, animationDelay: "200ms" }}>
            Learn before you earn. Form a Kitchen, cook recipes with your table, and beat Gordon. An educational paper-trading simulation — no real money, no broker, no risk.
          </p>

          <div className="join-rise" style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", animationDelay: "280ms" }}>
            <button type="button" onClick={download} style={cta}>
              <Download size={16} strokeWidth={1.9} aria-hidden />
              {ctaLabel}
              <ArrowRight size={15} strokeWidth={1.9} aria-hidden />
            </button>
            <Link href="/login" style={{ ...mono("#fff"), textDecoration: "underline", textUnderlineOffset: 3, display: "inline-flex", alignItems: "center", gap: 6 }}>
              Enter on the web
            </Link>
          </div>

          {showIosHelp && (
            <div className="join-rise" style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.25)", padding: "12px 14px", maxWidth: 440 }}>
              <p style={{ ...mono("rgba(255,255,255,0.6)"), margin: "0 0 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Smartphone size={13} strokeWidth={1.9} aria-hidden /> Install on iPhone
              </p>
              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.86rem", lineHeight: 1.55, color: "rgba(255,255,255,0.82)", margin: 0, display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                Tap <Share size={14} strokeWidth={1.9} aria-hidden style={{ verticalAlign: "middle" }} /> Share, then <b>Add to Home Screen</b>.
              </p>
            </div>
          )}

          <p className="join-rise" style={{ ...mono("rgba(255,255,255,0.45)"), margin: "22px 0 0", animationDelay: "360ms", fontSize: "0.52rem", lineHeight: 1.7 }}>
            Installs to your home screen · runs full-screen, native-feel
          </p>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.16)", padding: "12px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={mono("rgba(255,255,255,0.35)")}>MOCK_MVP_PAPER_TRADING_ONLY</span>
          <span style={mono("rgba(255,255,255,0.35)")}>Not financial advice</span>
        </div>
      </div>
    </main>
  );
}

const shell: React.CSSProperties = {
  minHeight: "100svh",
  background: "#000",
  color: "#fff",
  position: "relative",
  overflow: "hidden",
};
const cta: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "15px 26px",
  background: "#fff",
  color: "#000",
  border: "none",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  cursor: "pointer",
  minHeight: 50,
};
function mono(color: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-mono), monospace",
    fontSize: "0.58rem",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color,
  };
}
