"use client";

import { CheckCircle2 } from "lucide-react";

export function TaskToast({ title, line }: { title: string; line?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "calc(96px + env(safe-area-inset-top, 0px))",
        right: 14,
        zIndex: 430,
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        gap: 9,
        alignItems: "start",
        maxWidth: "min(340px, calc(100vw - 28px))",
        background: "var(--yi-black)",
        color: "var(--yi-white)",
        border: "1px solid var(--yi-frame)",
        padding: "11px 13px",
        animation: "task-toast-in 260ms ease both",
      }}
    >
      <style>{`@keyframes task-toast-in{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <CheckCircle2 size={15} strokeWidth={1.8} aria-hidden style={{ marginTop: 1 }} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          {title}
        </span>
        {line && (
          <span style={{ display: "block", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.76rem", lineHeight: 1.35, opacity: 0.75, marginTop: 3 }}>
            {line}
          </span>
        )}
      </span>
    </div>
  );
}
