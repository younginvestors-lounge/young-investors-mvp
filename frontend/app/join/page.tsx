"use client";

/**
 * /join - official Young Investors install landing.
 * MOCK_MVP_PAPER_TRADING_ONLY - educational simulation, no real money.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Share, Smartphone } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function rnd(seed: number): number {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}

const PAN_MARKS = ["60%", "JSE", "VOTE", "VAULT", "RISK", "HOLD", "BUY", "SELL", "SHELF", "CHEF"];
const PAN_TILES = Array.from({ length: 84 }, (_, i) => {
  const row = Math.floor(i / 14);
  const a = rnd(i + 1.2);
  const b = rnd(i + 17.4);
  return {
    key: i,
    mark: PAN_MARKS[(i + row) % PAN_MARKS.length],
    rot: `${[0, 90, 180, 270][(i + row) % 4]}deg`,
    delay: `${-Math.round((a * 3600 + b * 2200) % 5800)}ms`,
    scale: (0.86 + a * 0.34).toFixed(2),
  };
});

export default function JoinPage() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [paused, setPaused] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const iosCardRef = useRef<HTMLDivElement | null>(null);

  // Pause the animated grid whenever the tab is hidden - don't spend GPU on
  // pixels nobody is looking at. Lighter on integrated/low-power graphics.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

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
    if (installed) {
      window.location.href = "/login";
      return;
    }
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    if (isIOS) {
      // No programmatic install on iOS — point the chef at the Share-sheet steps.
      iosCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setIosHint(true);
      setTimeout(() => setIosHint(false), 2600);
      return;
    }
    window.location.href = "/login";
  }

  const ctaLabel = installed ? "Open the App" : "Download Now";

  return (
    <main className={`join-page${paused ? " is-paused" : ""}`} style={shell}>
      <style>{`
        .join-page {
          --join-bg: #ffffff;
          --join-fg: #000000;
          --join-muted: rgba(0,0,0,0.62);
          --join-soft: rgba(0,0,0,0.035);
          --join-line: rgba(0,0,0,0.16);
          --join-cell-off: rgba(0,0,0,0.018);
          --join-cell-on: rgba(0,0,0,0.12);
          --join-mark-off: rgba(0,0,0,0.14);
          --join-mark-on: rgba(255,255,255,0.68);
          --join-logo-filter: invert(1);
        }
        :root[data-theme="dark"] .join-page {
          --join-bg: #000000;
          --join-fg: #ffffff;
          --join-muted: rgba(255,255,255,0.62);
          --join-soft: rgba(255,255,255,0.035);
          --join-line: rgba(255,255,255,0.16);
          --join-cell-off: rgba(255,255,255,0.014);
          --join-cell-on: rgba(255,255,255,0.14);
          --join-mark-off: rgba(255,255,255,0.14);
          --join-mark-on: rgba(0,0,0,0.62);
          --join-logo-filter: none;
        }
        @keyframes join-stage-pan {
          0% { transform: translate3d(-10vw, 2vh, 0) rotate(-8deg); }
          50% { transform: translate3d(0, -1vh, 0) rotate(-8deg); }
          100% { transform: translate3d(10vw, -3vh, 0) rotate(-8deg); }
        }
        @keyframes join-stage-pan-two {
          0% { transform: translate3d(9vw, -4vh, 0) rotate(8deg); }
          50% { transform: translate3d(0, 1vh, 0) rotate(8deg); }
          100% { transform: translate3d(-9vw, 3vh, 0) rotate(8deg); }
        }
        @keyframes join-cell-tone {
          0%, 44% { background: var(--join-cell-off); }
          45%, 56% { background: var(--join-cell-on); }
          57%, 100% { background: var(--join-cell-off); }
        }
        @keyframes join-triangle-cycle {
          0% {
            transform: scale(calc(var(--scale) * 1.25)) rotate(var(--rot));
            background: var(--join-fg);
            opacity: 0.045;
          }
          34% {
            transform: scale(calc(var(--scale) * 0.46)) rotate(calc(var(--rot) + 14deg));
            background: var(--join-fg);
            opacity: 0.2;
          }
          49% {
            transform: scale(calc(var(--scale) * 0.18)) rotate(calc(var(--rot) + 22deg));
            background: var(--join-fg);
            opacity: 0.28;
          }
          50% {
            transform: scale(calc(var(--scale) * 0.22)) rotate(calc(var(--rot) + 22deg));
            background: var(--join-bg);
            opacity: 0.55;
          }
          73% {
            transform: scale(calc(var(--scale) * 0.72)) rotate(calc(var(--rot) + 38deg));
            background: var(--join-bg);
            opacity: 0.28;
          }
          100% {
            transform: scale(calc(var(--scale) * 1.18)) rotate(calc(var(--rot) + 52deg));
            background: var(--join-fg);
            opacity: 0.05;
          }
        }
        @keyframes join-mark-cycle {
          0%, 44% { color: var(--join-mark-off); }
          45%, 56% { color: var(--join-mark-on); }
          57%, 100% { color: var(--join-mark-off); }
        }
        @keyframes join-content-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .join-pan-grid {
          position: absolute;
          inset: -22vh -24vw;
          display: grid;
          grid-template-columns: repeat(14, minmax(58px, 8vw));
          grid-auto-rows: minmax(58px, 8vw);
          border-top: 1px solid var(--join-line);
          border-left: 1px solid var(--join-line);
          animation: join-stage-pan 10s linear infinite alternate;
        }
        .join-pan-grid-alt {
          opacity: 0.72;
          animation-name: join-stage-pan-two;
          animation-duration: 13s;
        }
        .join-pan-tile {
          position: relative;
          overflow: hidden;
          border-right: 1px solid var(--join-line);
          border-bottom: 1px solid var(--join-line);
          animation: join-cell-tone 5800ms steps(1, end) infinite;
          animation-delay: var(--delay);
        }
        .join-pan-tile::before {
          content: "";
          position: absolute;
          inset: 18%;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          transform-origin: 50% 62%;
          animation: join-triangle-cycle 5800ms cubic-bezier(.72,0,.18,1) infinite;
          animation-delay: var(--delay);
        }
        .join-pan-tile::after {
          content: attr(data-mark);
          position: absolute;
          left: 9%;
          bottom: 8%;
          font-family: var(--font-mono), monospace;
          font-size: clamp(0.42rem, 0.68vw, 0.58rem);
          letter-spacing: 0.14em;
          animation: join-mark-cycle 5800ms steps(1, end) infinite;
          animation-delay: var(--delay);
        }
        .join-content {
          width: min(100%, 620px);
          margin: 0 auto;
          display: grid;
          justify-items: center;
          gap: 18px;
          padding: clamp(28px, 6vw, 64px) 22px;
          text-align: center;
          animation: join-content-in 640ms cubic-bezier(.16,.84,.44,1) both;
        }
        .join-logo {
          width: clamp(148px, 24vw, 230px);
          height: auto;
          filter: var(--join-logo-filter);
        }
        .join-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .join-secondary {
          display: inline-flex;
          min-height: 52px;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--join-line);
          color: var(--join-fg);
          padding: 15px 24px;
          font-family: var(--font-mono), monospace;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none;
          background: transparent;
        }
        .join-secondary:hover {
          background: var(--join-soft);
        }
        .join-page.is-paused .join-pan-grid,
        .join-page.is-paused .join-pan-tile,
        .join-page.is-paused .join-pan-tile::before,
        .join-page.is-paused .join-pan-tile::after {
          animation-play-state: paused !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .join-pan-grid,
          .join-pan-tile,
          .join-pan-tile::before,
          .join-pan-tile::after,
          .join-content {
            animation: none !important;
          }
          .join-pan-tile::before {
            background: var(--join-fg);
            opacity: 0.09;
            transform: scale(0.72) rotate(var(--rot));
          }
        }
      `}</style>

      <div aria-hidden style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, background: "var(--join-bg)" }}>
        <div className="join-pan-grid">
          {PAN_TILES.map((tile) => (
            <span
              key={tile.key}
              className="join-pan-tile"
              data-mark={tile.mark}
              style={{
                ["--rot" as string]: tile.rot,
                ["--delay" as string]: tile.delay,
                ["--scale" as string]: tile.scale,
              }}
            />
          ))}
        </div>
        <div className="join-pan-grid join-pan-grid-alt">
          {PAN_TILES.slice().reverse().map((tile) => (
            <span
              key={`alt-${tile.key}`}
              className="join-pan-tile"
              data-mark={tile.mark}
              style={{
                ["--rot" as string]: tile.rot,
                ["--delay" as string]: `${parseInt(tile.delay, 10) - 1900}ms`,
                ["--scale" as string]: tile.scale,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 0 }}>
        <div style={{ height: 2, background: "var(--join-fg)", flexShrink: 0 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "18px 24px 0" }}>
          <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "1rem", fontWeight: 700, letterSpacing: 0, color: "var(--join-fg)" }}>
            Young Investors
          </span>
          <span style={mono("var(--join-muted)")}>We Cook.</span>
        </div>

        <section className="join-content" aria-labelledby="join-heading">
          <h1 id="join-heading" style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(2.45rem, 11vw, 6.2rem)", fontWeight: 700, lineHeight: 0.9, letterSpacing: 0, color: "var(--join-fg)", margin: 0 }}>
            Join The<br />Syndicate
          </h1>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "clamp(0.9rem, 2.8vw, 1rem)", lineHeight: 1.55, color: "var(--join-muted)", margin: 0, maxWidth: 430 }}>
            Download the Young Investors web app, or continue in your browser.
          </p>

          <div className="join-actions">
            <button type="button" onClick={download} style={cta}>
              <Download size={16} strokeWidth={1.9} aria-hidden />
              {ctaLabel}
              <ArrowRight size={15} strokeWidth={1.9} aria-hidden />
            </button>
            <Link href="/login" className="join-secondary">
              Continue to Web
            </Link>
          </div>

          <div ref={iosCardRef} style={{ marginTop: 2, border: "1px solid var(--join-fg)", background: "var(--join-fg)", color: "var(--join-bg)", padding: "14px 16px", maxWidth: 460, outline: iosHint ? "3px solid var(--join-fg)" : "none", outlineOffset: 4, transition: "outline-color 300ms ease" }}>
            <p style={{ ...mono("var(--join-bg)"), margin: "0 0 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Smartphone size={13} strokeWidth={1.9} aria-hidden /> Install on iPhone
            </p>
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.55, color: "var(--join-bg)", margin: 0, display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              Tap <Share size={14} strokeWidth={1.9} aria-hidden style={{ verticalAlign: "middle" }} /> Share, then <b>Add to Home Screen</b>.
            </p>
          </div>

          <p style={{ ...mono("var(--join-muted)"), margin: 0, fontSize: "0.52rem", lineHeight: 1.7 }}>
            Home screen install - full screen, native feel
          </p>
        </section>

        <div style={{ borderTop: "1px solid var(--join-line)", padding: "12px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={mono("var(--join-muted)")}>MOCK_MVP_PAPER_TRADING_ONLY</span>
          <span style={mono("var(--join-muted)")}>Not financial advice</span>
        </div>
      </div>
    </main>
  );
}

const shell: React.CSSProperties = {
  minHeight: "100svh",
  background: "var(--join-bg)",
  color: "var(--join-fg)",
  position: "relative",
  overflow: "hidden",
};

const cta: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  padding: "15px 24px",
  background: "var(--join-fg)",
  color: "var(--join-bg)",
  border: "1px solid var(--join-fg)",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  cursor: "pointer",
  minHeight: 52,
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
