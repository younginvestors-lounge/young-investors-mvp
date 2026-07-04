"use client";

import { useEffect, useMemo, useState } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { formatRand } from "@/lib/jseMarket";
import { readShelfReceipts, SHELF_EVENT } from "@/lib/shelfStore";
import {
  isPublicLedgerVisible,
  PUBLIC_LEDGER_RECONCILIATION_DELAY_MS,
  readTerminalEvents,
  TERMINAL_EVENT,
  type TerminalEvent,
  withTerminalReceipt,
} from "@/lib/transactionTerminal";
import type { KitchenVaultLedger } from "@/lib/profileStore";

interface TransactionTerminalProps {
  surface: "lobby" | "kitchen";
  kitchenVault?: KitchenVaultLedger;
  compact?: boolean;
  maxRows?: number;
}

function terminalTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat("en-ZA", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(ts);
  } catch {
    return "Paper time";
  }
}

function statusColor(status: TerminalEvent["status"]): string {
  if (status === "approved") return "#167a3a";
  if (status === "rejected") return "#b42318";
  if (status === "pending") return "#b46918";
  if (status === "paper") return "var(--yi-ink)";
  return "var(--yi-muted)";
}

function delayText(ms: number): string {
  if (ms <= 0) return "public";
  const minutes = Math.ceil(ms / 60000);
  return `${minutes}m delay`;
}

function mergeEvents(base: TerminalEvent[], kitchenVault?: KitchenVaultLedger): TerminalEvent[] {
  const projectedShelf: TerminalEvent[] = readShelfReceipts().map((receipt) => withTerminalReceipt({
    id: `shelf-open-${receipt.id}`,
    kind: "shelf_receipt",
    title: "Shelf receipt pending",
    line: `${receipt.decision} ${receipt.symbol} waiting for Kitchen proposal`,
    ticker: receipt.symbol,
    side: receipt.decision,
    amount: receipt.notional,
    status: "pending",
    createdAt: receipt.createdAt,
    mode: "MOCK_MVP_PAPER_TRADING_ONLY",
  }));

  const projectedExecutions: TerminalEvent[] = (kitchenVault?.receipts ?? []).map((receipt) => {
    const createdAt = Date.parse(receipt.executedAt);
    return withTerminalReceipt({
      id: `execution-${receipt.id}`,
      kind: "paper_execution",
      title: "Kitchen Vault receipt",
      line: `${receipt.side} ${receipt.ticker} cleared by the 60% Rule`,
      ticker: receipt.ticker,
      side: receipt.side,
      amount: receipt.notional,
      status: "paper",
      createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
      mode: "MOCK_MVP_PAPER_TRADING_ONLY",
    });
  });

  const byId = new Map<string, TerminalEvent>();
  [...base, ...projectedShelf, ...projectedExecutions].forEach((event) => byId.set(event.id, event));
  return Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function TransactionTerminal({ surface, kitchenVault, compact = false, maxRows = 7 }: TransactionTerminalProps) {
  const [events, setEvents] = useState<TerminalEvent[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const load = () => setEvents(readTerminalEvents());
    load();
    window.addEventListener(TERMINAL_EVENT, load);
    window.addEventListener(SHELF_EVENT, load);
    return () => {
      window.removeEventListener(TERMINAL_EVENT, load);
      window.removeEventListener(SHELF_EVENT, load);
    };
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(t);
  }, []);

  const rows = useMemo(() => {
    const merged = mergeEvents(events, kitchenVault);
    return (surface === "lobby" ? merged.filter((event) => isPublicLedgerVisible(event, now)) : merged).slice(0, maxRows);
  }, [events, kitchenVault, maxRows, now, surface]);
  const totalAmount = rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);

  return (
    <section
      aria-labelledby={`${surface}-terminal-heading`}
      style={{
        border: "1px solid var(--yi-black)",
        background: "var(--yi-card-bg)",
        color: "var(--yi-ink)",
        display: "grid",
        gap: 0,
      }}
    >
      <div style={{ background: "var(--yi-black)", color: "var(--yi-white)", padding: compact ? "10px 12px" : "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <TerminalIcon size={16} strokeWidth={1.8} aria-hidden />
          <div style={{ minWidth: 0 }}>
            <h3 id={`${surface}-terminal-heading`} style={{ fontFamily: "var(--font-mono), monospace", fontSize: compact ? "0.62rem" : "0.68rem", textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>
              Terminal 01
            </h3>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.48rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "2px 0 0", opacity: 0.7 }}>
              Triple-ledger mock accounting
            </p>
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid rgba(255,255,255,0.32)", padding: "3px 6px", flexShrink: 0 }}>
          5m reconcile
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1.2fr 0.8fr", borderBottom: "1px solid var(--yi-frame)" }}>
        <div style={{ padding: compact ? "10px 12px" : "12px 14px", borderRight: compact ? "none" : "1px solid var(--yi-frame)" }}>
          <p className="meta" style={{ margin: "0 0 4px" }}>Triple ledger</p>
          <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: compact ? "1.05rem" : "1.22rem", lineHeight: 1.1, margin: 0 }}>
            Personal, Kitchen, Public.
          </p>
        </div>
        {!compact && (
          <div style={{ padding: "12px 14px" }}>
            <p className="meta" style={{ margin: "0 0 4px" }}>{surface === "lobby" ? "Public decisions" : "Open paper balance"}</p>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
              {surface === "lobby" ? rows.length : formatRand(totalAmount)}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: "grid" }}>
        {rows.length === 0 ? (
          <div style={{ padding: compact ? "14px 12px" : "18px 14px", borderTop: "1px solid var(--yi-hairline)" }}>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: compact ? "0.62rem" : "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: 0 }}>
              {surface === "lobby"
                ? "No public receipt is visible yet. New decisions publish after the five-minute reconciliation window."
                : "No accounting receipt committed yet. Create a Shelf receipt or vote a recipe to wake the terminal."}
            </p>
          </div>
        ) : (
          rows.map((event) => {
            const ready = isPublicLedgerVisible(event, now);
            const remaining = Math.max(0, event.receipt.publicVisibleAt - now);
            return (
              <article key={event.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "start", padding: compact ? "10px 12px" : "11px 14px", borderTop: "1px solid var(--yi-hairline)" }}>
                <span style={{ width: 7, height: 7, marginTop: 5, border: "1px solid var(--yi-frame)", background: ready ? statusColor(event.status) : "#b46918", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: compact ? "0.58rem" : "0.64rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-ink)", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {surface === "lobby" ? event.receipt.faces.publicLedger.title : event.title}
                  </p>
                  <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: compact ? "0.78rem" : "0.84rem", lineHeight: 1.35, color: "var(--yi-copy)", margin: 0 }}>
                    {surface === "lobby" ? event.receipt.faces.publicLedger.summary : event.line}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: "5px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ready
                      ? `${event.receipt.publicRef} / Kitchen concealed / ${event.receipt.commitment}`
                      : `Reconciling inside We Cook / public face in ${delayText(remaining)}`}
                  </p>
                  {!compact && surface === "kitchen" && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7 }}>
                      {[
                        event.receipt.faces.personalChef,
                        event.receipt.faces.kitchen,
                        event.receipt.faces.publicLedger,
                      ].map((face) => (
                        <span key={face.face} style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.48rem", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--yi-hairline)", color: face.visibility === "public" && !ready ? "#b46918" : "var(--yi-muted)", padding: "3px 5px" }}>
                          {face.title}{face.visibility === "public" && !ready ? " pending" : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", minWidth: 78 }}>
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.08em", color: ready ? statusColor(event.status) : "#b46918", margin: "0 0 4px" }}>
                    {ready ? event.status : "reconcile"}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", color: "var(--yi-muted)", margin: 0 }}>
                    {surface === "lobby" || event.amount == null ? terminalTime(event.createdAt) : formatRand(event.amount)}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.48rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0, padding: compact ? "9px 12px" : "10px 14px", borderTop: "1px solid var(--yi-frame)" }}>
        MOCK_MVP_PAPER_TRADING_ONLY / public face delayed {Math.round(PUBLIC_LEDGER_RECONCILIATION_DELAY_MS / 60000)}m / Kitchen identity concealed / no live settlement
      </p>
    </section>
  );
}
