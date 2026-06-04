"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { GLOSSARY_LIST, READER_LEVELS, type GlossaryLevels } from "@/lib/gordonGlossary";
import { tap } from "@/lib/haptics";

interface GlossaryBookProps {
  open: boolean;
  onClose: () => void;
}

export function GlossaryBook({ open, onClose }: GlossaryBookProps) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<keyof GlossaryLevels>("eighteen");
  const [desktop, setDesktop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(media.matches);
    update();
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener?.(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener?.(update);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return GLOSSARY_LIST;
    return GLOSSARY_LIST.filter((entry) => {
      const haystack = [
        entry.term,
        entry.kitchen,
        entry.cooking,
        entry.slang,
        entry.origin ?? "",
        entry.related.join(" "),
      ].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Master Chef's Cookbook"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 320,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: desktop ? "center" : "flex-end",
        justifyContent: "center",
        padding: desktop ? 24 : 0,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: desktop ? "86svh" : "92svh",
          background: "var(--yi-paper)",
          color: "var(--yi-ink)",
          border: "1px solid var(--yi-frame)",
          borderBottom: desktop ? "1px solid var(--yi-frame)" : "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--yi-hairline)" }}>
          <div style={{ minWidth: 0 }}>
            <p style={mono("var(--yi-muted)", "0.56rem")}>Gordon&apos;s Glossary</p>
            <h2 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.1, margin: "4px 0 0" }}>
              Master Chef&apos;s Cookbook
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close glossary" title="Close" style={iconBtn}>
            <X size={16} strokeWidth={1.8} aria-hidden />
          </button>
        </div>

        <div style={{ display: "grid", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--yi-hairline)" }}>
          <label style={{ position: "relative", display: "block" }}>
            <Search size={14} strokeWidth={1.8} aria-hidden style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--yi-muted)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms, kitchen names, signals"
              aria-label="Search Gordon's Glossary"
              style={{
                width: "100%",
                minHeight: 42,
                border: "1px solid var(--yi-frame)",
                background: "var(--yi-paper)",
                color: "var(--yi-ink)",
                padding: "0 10px 0 34px",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                outline: "none",
              }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: `repeat(${READER_LEVELS.length}, 1fr)`, border: "1px solid var(--yi-frame)" }}>
            {READER_LEVELS.map(({ key, label }, i) => {
              const active = level === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setLevel(key); tap(); }}
                  aria-pressed={active}
                  style={{
                    minHeight: 38,
                    border: "none",
                    borderRight: i < READER_LEVELS.length - 1 ? "1px solid var(--yi-frame)" : "none",
                    background: active ? "var(--yi-black)" : "transparent",
                    color: active ? "var(--yi-white)" : "var(--yi-ink)",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.56rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div ref={scrollRef} style={{ overflowY: "auto", padding: "14px 16px", display: "grid", gap: 10 }}>
          {results.map((entry) => (
            <article key={entry.key} style={{ border: "1px solid var(--yi-frame)", padding: "12px 14px", display: "grid", gap: 7, background: "var(--yi-card-bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.02rem", fontWeight: 600, lineHeight: 1.1, margin: 0 }}>
                  {entry.term}
                </h3>
                <span style={{ ...mono("var(--yi-muted)", "0.52rem"), border: "1px solid var(--yi-frame)", padding: "2px 6px" }}>
                  {entry.kitchen}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0 }}>
                {entry.levels[level]}
              </p>
              <p style={{ display: "flex", gap: 6, alignItems: "flex-start", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.82rem", lineHeight: 1.5, color: "var(--yi-copy)", fontStyle: "italic", margin: 0 }}>
                <BookOpen size={13} strokeWidth={1.8} aria-hidden style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{entry.cooking}</span>
              </p>
              {entry.related.length > 0 && (
                <p style={{ ...mono("var(--yi-muted)", "0.5rem"), margin: 0, textTransform: "none", letterSpacing: "0.04em" }}>
                  connects to: {entry.related.join(" / ")}
                </p>
              )}
            </article>
          ))}
          {results.length === 0 && (
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", margin: 0 }}>
              No glossary term found. Try a market word, a Kitchen word, or a risk signal.
            </p>
          )}
        </div>

        <p style={{ ...mono("var(--yi-muted)", "0.5rem"), padding: "10px 16px", margin: 0, borderTop: "1px solid var(--yi-hairline)", lineHeight: 1.5 }}>
          Educational glossary only / MOCK_MVP_PAPER_TRADING_ONLY / Not financial advice
        </p>
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
  border: "1px solid var(--yi-hairline)",
  color: "var(--yi-muted)",
  cursor: "pointer",
};

function mono(color: string, fontSize: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-mono), monospace",
    fontSize,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color,
    margin: 0,
  };
}
