import clsx from "clsx";
import { AlertTriangle, Brain } from "lucide-react";
import type { GordonMarketRead } from "@/lib/types";

interface GordonPanelProps {
  read: GordonMarketRead;
  compact?: boolean;
}

export function GordonPanel({ read, compact = false }: GordonPanelProps) {
  const hasCriticalAlerts = read.criticalAlerts.length > 0;
  const riskBadgeClass =
    hasCriticalAlerts || read.riskScore >= 70
      ? "badge-critical"
      : read.riskScore >= 50
        ? "badge-watch"
        : "badge-positive";

  return (
    <aside className={clsx("gordon-panel", hasCriticalAlerts && "gordon-panel-critical")}>
      <div className="status-line">
        <Brain className="icon-inline" aria-hidden="true" />
        <span className="badge">Gordon's chef note</span>
        <span className={clsx("badge", riskBadgeClass)}>
          Heat {read.riskScore}
        </span>
      </div>
      <h2 className="section-title">{read.stance}</h2>
      <p className="copy">{read.summary}</p>
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
