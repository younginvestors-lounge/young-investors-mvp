"use client";

import clsx from "clsx";
import { AlertTriangle, Brain } from "lucide-react";
import { useTypewriter } from "@/lib/useTypewriter";
import type { GordonMarketRead } from "@/lib/types";

interface GordonPanelProps {
  read: GordonMarketRead;
  compact?: boolean;
}

function TypedCopy({ text }: { text: string }) {
  const { displayed, done } = useTypewriter(text, { speed: 16, delay: 300 });
  return (
    <span>
      {displayed}
      {!done && (
        <span style={{
          display: "inline-block", width: 2, height: "1em",
          background: "#b42318", marginLeft: 2,
          verticalAlign: "text-bottom",
          animation: "cursor-blink 700ms step-end infinite",
        }} aria-hidden />
      )}
    </span>
  );
}

export function GordonPanel({ read, compact = false }: GordonPanelProps) {
  const hasCriticalAlerts = read.criticalAlerts.length > 0;
  const riskBadgeClass =
    hasCriticalAlerts || read.riskScore >= 70 ? "badge-critical"
    : read.riskScore >= 50 ? "badge-watch"
    : "badge-positive";

  return (
    <aside className={clsx("gordon-panel", hasCriticalAlerts && "gordon-panel-critical")}>
      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      <div className="status-line">
        <Brain className="icon-inline" aria-hidden="true" />
        <span className="badge">Gordon&apos;s chef note</span>
        <span className={clsx("badge", riskBadgeClass)}>Heat {read.riskScore}</span>
      </div>
      <h2 className="section-title">{read.stance}</h2>
      <p className="copy"><TypedCopy text={read.summary} /></p>
      {!compact && hasCriticalAlerts ? (
        <ul className="list-reset stack" aria-label="Critical Gordon heat notes">
          {read.criticalAlerts.map((alert) => (
            <li key={alert} className="status-line critical">
              <AlertTriangle className="icon-inline" aria-hidden="true" />
              <span className="meta">{alert}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
