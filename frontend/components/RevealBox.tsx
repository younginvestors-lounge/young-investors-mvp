"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface RevealBoxProps {
  symbol: ReactNode;
  title: string;
  meta?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  tone?: "neutral" | "positive" | "watch" | "negative";
}

const toneColor = {
  neutral: "var(--yi-ink)",
  positive: "#167a3a",
  watch: "#b46918",
  negative: "#b42318",
};

export function RevealBox({ symbol, title, meta, children, defaultOpen = false, tone = "neutral" }: RevealBoxProps) {
  return (
    <details open={defaultOpen} style={{ border: "1px solid var(--yi-frame)", background: "var(--yi-card-bg)" }}>
      <summary
        style={{
          minHeight: 50,
          display: "grid",
          gridTemplateColumns: "32px 1fr auto",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          cursor: "pointer",
          listStyle: "none",
        }}
      >
        <span style={{ width: 28, height: 28, border: `1px solid ${toneColor[tone]}`, color: toneColor[tone], display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {symbol}
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--yi-ink)", lineHeight: 1.15 }}>
            {title}
          </span>
          {meta && (
            <span style={{ display: "block", fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", marginTop: 3 }}>
              {meta}
            </span>
          )}
        </span>
        <ChevronDown size={15} strokeWidth={1.8} aria-hidden style={{ color: "var(--yi-muted)" }} />
      </summary>
      <div style={{ borderTop: "1px solid var(--yi-hairline)", padding: "14px" }}>
        {children}
      </div>
    </details>
  );
}
