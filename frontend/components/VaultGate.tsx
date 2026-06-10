"use client";

/**
 * Vault gating for the tester build.
 *
 * Testers do not get the Vault until they finish the Academy. Then they're granted
 * R1,001 of *practice* capital and the paper simulation begins. No fake holdings,
 * no fake performance — the real thing now.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — pretend money, real lessons. Never financial advice.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { LockKeyhole, ReceiptText, Scale, Trash2, Vault as VaultIcon } from "lucide-react";
import { clearShelfReceipts, readShelfReceipts, SHELF_EVENT, type ShelfReceipt } from "@/lib/shelfStore";
import { notifyTask } from "@/lib/taskToast";

export const STARTING_CAPITAL = "R1,001.00";

function money(n: number): string {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function receiptDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat("en-ZA", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(ts);
  } catch {
    return "Mock receipt";
  }
}

/** Shown when a Chef taps the Vault before finishing the Academy. */
export function VaultLocked({ passedCount, totalCount }: { passedCount: number; totalCount: number }) {
  const pct = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const remaining = Math.max(0, totalCount - passedCount);

  return (
    <section style={{ display: "grid", gap: 18 }} aria-labelledby="vault-locked-heading">
      <div>
        <p className="eyebrow">Wealth Creation Tool</p>
        <h2 id="vault-locked-heading" className="view-title">The Vault</h2>
      </div>

      <div style={{ border: "1px solid #b42318", padding: "24px 20px", background: "var(--yi-card-bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <LockKeyhole size={20} strokeWidth={1.6} aria-hidden style={{ color: "#b42318" }} />
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "#b42318" }}>
            Vault locked
          </span>
        </div>

        <p style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.25rem,4.5vw,1.6rem)", fontWeight: 600, lineHeight: 1.2, color: "var(--yi-ink)", margin: "0 0 12px" }}>
          Finish the Academy to unlock your Vault — and claim your {STARTING_CAPITAL} of practice capital.
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: "0 0 16px" }}>
          No shortcuts. You don&apos;t get to cook with capital — even pretend capital — until Gordon knows you understand the words and the rules. That&apos;s the deal.
        </p>

        <div className="progress-track" aria-hidden="true" style={{ marginBottom: 8 }}>
          <div className="progress-fill-watch" style={{ width: `${pct}%` }} />
        </div>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: 0 }}>
          {passedCount} of {totalCount} lessons cleared · {remaining} to go
        </p>
      </div>

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: 0 }}>
        Build the Academy receipts · Educational simulation only
      </p>
    </section>
  );
}

function VaultShelfReceipts() {
  const [receipts, setReceipts] = useState<ShelfReceipt[]>([]);

  useEffect(() => {
    const load = () => setReceipts(readShelfReceipts());
    load();
    window.addEventListener(SHELF_EVENT, load);
    return () => window.removeEventListener(SHELF_EVENT, load);
  }, []);

  function clearReceipts() {
    clearShelfReceipts();
    notifyTask("Shelf cleared", "Your mock receipts were removed from this device.");
  }

  return (
    <div style={{ border: "1px solid var(--yi-frame)", padding: "16px 18px", background: "var(--yi-card-bg)", display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 8px" }}>
            <ReceiptText size={14} strokeWidth={1.8} aria-hidden /> The Shelf
          </p>
          <h3 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.15rem", fontWeight: 600, lineHeight: 1.15, color: "var(--yi-ink)", margin: 0 }}>
            Mock receipts waiting for a Kitchen vote
          </h3>
        </div>
        {receipts.length > 0 && (
          <button
            type="button"
            onClick={clearReceipts}
            title="Clear Shelf receipts"
            style={{ minHeight: 34, border: "1px solid var(--yi-frame)", background: "transparent", color: "var(--yi-muted)", display: "inline-flex", alignItems: "center", gap: 7, padding: "0 10px", fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
          >
            <Trash2 size={13} strokeWidth={1.8} aria-hidden /> Clear
          </button>
        )}
      </div>

      {receipts.length === 0 ? (
        <div style={{ border: "1px solid var(--yi-hairline)", padding: "13px 14px", background: "var(--yi-paper)" }}>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0 }}>
            Your Shelf is empty. Go to Shop, open the Stock Aisle, then long-press a company to choose buy, sell, or hold before the Kitchen votes.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {receipts.map((receipt) => (
            <article key={receipt.id} style={{ border: "1px solid var(--yi-frame)", background: "var(--yi-paper)", padding: "12px 13px", display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: "0 0 4px" }}>
                    {receipt.decision === "SELL" ? "YI mock invoice of sale" : receipt.decision === "BUY" ? "YI mock purchase receipt" : "YI mock hold note"} / {receiptDate(receipt.createdAt)}
                  </p>
                  <h4 style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.95rem", fontWeight: 700, color: "var(--yi-ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {receipt.decision} {receipt.symbol}
                  </h4>
                </div>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid var(--yi-frame)", color: "var(--yi-muted)", padding: "3px 7px", flexShrink: 0 }}>
                  Paper
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                {[
                  ["Value", money(receipt.notional)],
                  ["Weight", `${receipt.weightPercent}%`],
                  ["Units", String(receipt.units)],
                  ["Price", money(receipt.price)],
                ].map(([label, value]) => (
                  <p key={label} style={{ margin: 0, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: "var(--font-mono), monospace", fontSize: "0.46rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)" }}>{label}</span>
                    <span style={{ display: "block", fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", color: "var(--yi-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
                  </p>
                ))}
              </div>

              <p style={{ display: "flex", alignItems: "flex-start", gap: 7, fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.82rem", lineHeight: 1.5, color: "var(--yi-copy)", margin: 0 }}>
                <Scale size={13} strokeWidth={1.8} aria-hidden style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{receipt.reason}</span>
              </p>
            </article>
          ))}
        </div>
      )}

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0, lineHeight: 1.5 }}>
        Shelf receipts are device-local / MOCK_MVP_PAPER_TRADING_ONLY / Not financial advice
      </p>
    </div>
  );
}

/** Shown once the Academy is cleared: the R1,001 grant + the start of the simulation. */
export function VaultStart({ chefName }: { chefName: string }) {
  return (
    <section style={{ display: "grid", gap: 18 }} aria-labelledby="vault-start-heading">
      <div>
        <p className="eyebrow">Cleared · Practice capital granted</p>
        <h2 id="vault-start-heading" className="view-title">The Vault</h2>
      </div>

      <div style={{ border: "1px solid #167a3a", padding: "24px 20px", background: "var(--yi-card-bg)", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <VaultIcon size={18} strokeWidth={1.7} aria-hidden style={{ color: "#167a3a" }} />
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#167a3a" }}>
            You cooked,{" "}
            <Link href="/profile" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Chef {chefName}
            </Link>
          </span>
        </div>

        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(2.4rem,12vw,3.6rem)", fontWeight: 700, lineHeight: 1, color: "var(--yi-ink)", margin: "0 0 6px" }}>
          {STARTING_CAPITAL}
        </p>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 16px" }}>
          Your practice capital · paper money
        </p>

        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.92rem", lineHeight: 1.65, color: "var(--yi-copy)", margin: "0 auto", maxWidth: 380 }}>
          The simulation starts here. This {STARTING_CAPITAL} is yours to cook with — propose recipes, vote with your Kitchen, and watch your Vault fill up as you trade. It&apos;s pretend money, but every lesson is real.
        </p>
      </div>

      <div style={{ border: "1px solid var(--yi-frame)", padding: "16px 18px", background: "var(--yi-card-bg)" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: "0 0 8px" }}>
          What happens next · follow the money
        </p>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--yi-copy)", margin: 0 }}>
          Right now your Vault is all cash — no positions yet. When your Kitchen votes a recipe through the 60% Rule, the holding shows up here with its plate weight and heat. No fake holdings. This is the real thing.
        </p>
      </div>

      <VaultShelfReceipts />

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: 0 }}>
        Paper trading only · No real money · No live execution · Not financial advice
      </p>
    </section>
  );
}
