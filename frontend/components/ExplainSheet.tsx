"use client";

/**
 * ExplainSheet — a tappable "what does this mean?" popup.
 *
 * People learn by poking at things. Any arbitrary figure or label in the app should
 * be tappable to explain itself in plain language (Occam's razor) with a little slang.
 *
 * User choice is primary: a corner control toggles between a comfortable bottom-sheet
 * and full-screen, and the preference is remembered.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — explanations only, never financial advice.
 */

import { useEffect, useState } from "react";
import { Maximize2, MessageSquare, Minimize2, X } from "lucide-react";
import { tap } from "@/lib/haptics";

export interface ExplainContent {
  title: string;
  /** The figure itself, shown big (e.g. "72%", "+1.8%"). Optional. */
  value?: string;
  valueColor?: string;
  /** Plain-language paragraphs. Keep them short and true. */
  lines: string[];
  /** One slang line. */
  slang?: string;
  /** Small print at the bottom. */
  footnote?: string;
}

function readFullPref(): boolean {
  try {
    return localStorage.getItem("yi_full_explain") === "1";
  } catch {
    return false;
  }
}

export function ExplainSheet({ content, onClose }: { content: ExplainContent | null; onClose: () => void }) {
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (content) setFull(readFullPref());
  }, [content]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (content) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [content, onClose]);

  if (!content) return null;

  function toggleFull() {
    tap();
    setFull((f) => {
      const next = !f;
      try { localStorage.setItem("yi_full_explain", next ? "1" : "0"); } catch {}
      return next;
    });
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`What ${content.title} means`}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: full ? "stretch" : "flex-end", justifyContent: "center" }}
    >
      <style>{`@keyframes explain-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div
        style={{
          background: "var(--yi-paper, #fff)",
          color: "var(--yi-ink, #111)",
          width: "100%",
          maxWidth: full ? "none" : 520,
          height: full ? "100%" : "auto",
          maxHeight: full ? "100%" : "88svh",
          overflowY: "auto",
          border: "1px solid var(--yi-frame, #ddd)",
          borderBottom: full ? "1px solid var(--yi-frame, #ddd)" : "none",
          padding: full
            ? "max(20px, env(safe-area-inset-top, 20px)) 20px max(20px, env(safe-area-inset-bottom, 20px))"
            : "18px 20px max(20px, env(safe-area-inset-bottom, 20px))",
          animation: "explain-in 200ms ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={mono("var(--yi-muted, #888)")}>What this means</span>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <button
              type="button"
              onClick={toggleFull}
              aria-label={full ? "Exit full screen" : "Full screen"}
              title={full ? "Exit full screen" : "Full screen"}
              style={iconBtn}
            >
              {full ? <Minimize2 size={15} strokeWidth={1.8} aria-hidden /> : <Maximize2 size={15} strokeWidth={1.8} aria-hidden />}
            </button>
            <button type="button" onClick={onClose} aria-label="Close" title="Close" style={iconBtn}>
              <X size={16} strokeWidth={1.8} aria-hidden />
            </button>
          </div>
        </div>

        <div style={{ flex: full ? 1 : "unset" }}>
          {content.value && (
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "2.2rem", fontWeight: 700, lineHeight: 1, margin: "0 0 6px", color: content.valueColor ?? "var(--yi-ink, #111)" }}>
              {content.value}
            </p>
          )}

          <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.25rem", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.1 }}>
            {content.title}
          </h3>

          <div style={{ display: "grid", gap: 8 }}>
            {content.lines.map((line, i) => (
              <p key={i} style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.92rem", lineHeight: 1.6, color: "var(--yi-copy, #444)", margin: 0 }}>
                {line}
              </p>
            ))}
          </div>

          {content.slang && (
            <p style={{ display: "flex", alignItems: "flex-start", gap: 6, fontFamily: "var(--font-mono), monospace", fontSize: "0.74rem", color: "#167a3a", margin: "12px 0 0", lineHeight: 1.5 }}>
              <MessageSquare size={13} strokeWidth={1.9} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{content.slang}</span>
            </p>
          )}

          {content.footnote && (
            <p style={{ ...mono("var(--yi-muted, #aaa)"), margin: "12px 0 0", fontSize: "0.52rem", lineHeight: 1.6 }}>
              {content.footnote}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{ marginTop: 16, minHeight: 46, width: "100%", background: "var(--yi-black, #111)", color: "var(--yi-white, #fff)", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer", flexShrink: 0 }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  background: "transparent",
  border: "1px solid var(--yi-hairline, #ddd)",
  color: "var(--yi-muted, #888)",
  cursor: "pointer",
};

function mono(color: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-mono), monospace",
    fontSize: "0.56rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color,
  };
}
