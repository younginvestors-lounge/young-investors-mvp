"use client";

import { useState } from "react";
import {
  SICILIA_FOLLOW_THE_MIND_PROMISE,
  siciliaCreedForDate,
  type SiciliaCreedEntry,
} from "@/lib/wealthCreationAcademy";

interface SiciliaCreedCardProps {
  surface: "Kitchen Table" | "Lounge";
  compact?: boolean;
  onLearnMore?: () => void;
}

export function SiciliaCreedCard({ surface, compact = false, onLearnMore }: SiciliaCreedCardProps) {
  const [creed] = useState<SiciliaCreedEntry>(() => siciliaCreedForDate());

  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono), monospace",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };

  return (
    <div style={{ border: "1px solid var(--yi-frame)", borderLeft: "2px solid var(--yi-black)", padding: compact ? "12px 14px" : "16px 18px", background: "var(--yi-card-bg)" }}>
      <p style={{ ...mono, fontSize: "0.54rem", color: "var(--yi-muted)", margin: "0 0 8px" }}>
        Sicilia · Young Investors Creed · Day {creed.day}/12 · {surface}
      </p>
      <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: compact ? "1rem" : "clamp(1rem,3.5vw,1.22rem)", fontWeight: 600, fontStyle: "italic", color: "var(--yi-ink)", margin: "0 0 8px", lineHeight: 1.35 }}>
        &ldquo;{creed.line}&rdquo;
      </p>
      <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", color: "var(--yi-copy)", lineHeight: 1.55, margin: 0 }}>
        <strong>{creed.field}:</strong> {creed.practice}
      </p>
      {!compact && (
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: 0, lineHeight: 1.5 }}>
            {SICILIA_FOLLOW_THE_MIND_PROMISE}
          </p>
          {onLearnMore && (
            <button
              type="button"
              onClick={onLearnMore}
              style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-ink)", background: "transparent", border: "1px solid var(--yi-frame)", padding: "4px 10px", cursor: "pointer", flexShrink: 0 }}
            >
              Learn the method →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
