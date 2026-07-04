"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { canApproveContribution } from "@/lib/domain";
import { formatRand } from "@/lib/jseMarket";
import {
  decideKitchenVaultContribution,
  getKitchenVaultContributions,
  getPersonalVaultContributions,
  requestKitchenVaultContribution,
  requestPersonalVaultContribution,
  type ContributionKind,
  type VaultContribution,
} from "@/lib/profileStore";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

function statusColor(status: VaultContribution["status"]): string {
  if (status === "approved") return "#167a3a";
  if (status === "rejected") return "#b42318";
  return "#b46918";
}

function IntentForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (kind: ContributionKind, amount: number) => void;
}) {
  const [kind, setKind] = useState<ContributionKind>("deposit");
  const [amount, setAmount] = useState("");

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid var(--yi-frame)" }}>
        {(["deposit", "withdrawal"] as const).map((k, i) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            style={{
              minHeight: 38, padding: "0 12px", border: "none",
              borderRight: i === 0 ? "1px solid var(--yi-frame)" : "none",
              background: kind === k ? "var(--yi-black)" : "transparent",
              color: kind === k ? "var(--yi-white)" : "var(--yi-ink)",
              ...mono, fontSize: "0.62rem", cursor: "pointer",
            }}
          >
            {k === "deposit" ? "Deposit" : "Withdraw"}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (R)"
        style={{ width: 120, border: "1px solid var(--yi-frame)", background: "transparent", color: "var(--yi-ink)", fontFamily: "var(--font-mono), monospace", fontSize: "0.8rem", padding: "8px 10px" }}
      />
      <button
        type="button"
        disabled={busy || !amount || Number(amount) <= 0}
        onClick={() => { onSubmit(kind, Number(amount)); setAmount(""); }}
        style={{ minHeight: 38, padding: "0 16px", background: "var(--yi-black)", color: "var(--yi-white)", border: "none", ...mono, fontSize: "0.62rem", cursor: busy ? "not-allowed" : "pointer", opacity: busy || !amount || Number(amount) <= 0 ? 0.5 : 1 }}
      >
        {busy ? "Sending…" : "Request →"}
      </button>
    </div>
  );
}

function IntentRow({ intent, children }: { intent: VaultContribution; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--yi-frame)", padding: "9px 12px", gap: 10, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <span style={{ ...mono, fontSize: "0.72rem", fontWeight: 700, color: "var(--yi-ink)" }}>
          {intent.kind === "deposit" ? "Deposit" : "Withdraw"} {formatRand(intent.amount)}
        </span>
        <span style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", marginLeft: 8 }}>
          {new Date(intent.requestedAt).toLocaleDateString()}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ ...mono, fontSize: "0.56rem", color: statusColor(intent.status), border: `1px solid ${statusColor(intent.status)}`, padding: "3px 7px" }}>
          {intent.status}
        </span>
        {children}
      </div>
    </div>
  );
}

/** Personal Vault: self-serve paper deposit/withdrawal — settles immediately. */
export function PersonalContributionIntents() {
  const [intents, setIntents] = useState<VaultContribution[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    getPersonalVaultContributions().then(setIntents);
  }

  useEffect(load, []);

  async function submit(kind: ContributionKind, amount: number) {
    setBusy(true);
    setError("");
    try {
      await requestPersonalVaultContribution(kind, amount);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't record that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0 }}>
        Your own paper capital — no co-signer needed. Every request settles immediately.
      </p>
      <IntentForm busy={busy} onSubmit={submit} />
      {error && <p style={{ ...mono, fontSize: "0.6rem", color: "#b42318", margin: 0 }}>{error}</p>}
      {intents.length > 0 && (
        <div style={{ display: "grid", gap: 6 }}>
          {intents.slice(0, 5).map((i) => <IntentRow key={i.id} intent={i} />)}
        </div>
      )}
    </div>
  );
}

/** Kitchen Vault: a joint-account intent — needs a co-signer who isn't the requester. */
export function KitchenContributionIntents() {
  const { user } = useAuth();
  const [intents, setIntents] = useState<VaultContribution[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    getKitchenVaultContributions().then(setIntents);
  }

  useEffect(load, []);

  async function submit(kind: ContributionKind, amount: number) {
    setBusy(true);
    setError("");
    try {
      await requestKitchenVaultContribution(kind, amount);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't submit that request.");
    } finally {
      setBusy(false);
    }
  }

  async function decide(id: string, approve: boolean) {
    setBusy(true);
    try {
      await decideKitchenVaultContribution(id, approve);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't record that decision.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: 0 }}>
        A joint-account intent for the shared pool — a co-signer who isn&apos;t you must approve it before it settles.
      </p>
      <IntentForm busy={busy} onSubmit={submit} />
      {error && <p style={{ ...mono, fontSize: "0.6rem", color: "#b42318", margin: 0 }}>{error}</p>}
      {intents.length > 0 && (
        <div style={{ display: "grid", gap: 6 }}>
          {intents.slice(0, 8).map((i) => (
            <IntentRow key={i.id} intent={i}>
              {user && canApproveContribution(i.userId, user.id, i.status) && (
                <span style={{ display: "flex", gap: 6 }}>
                  <button type="button" disabled={busy} onClick={() => decide(i.id, true)} style={{ ...mono, fontSize: "0.54rem", padding: "5px 9px", border: "1px solid #167a3a", background: "transparent", color: "#167a3a", cursor: busy ? "not-allowed" : "pointer" }}>
                    Approve
                  </button>
                  <button type="button" disabled={busy} onClick={() => decide(i.id, false)} style={{ ...mono, fontSize: "0.54rem", padding: "5px 9px", border: "1px solid #b42318", background: "transparent", color: "#b42318", cursor: busy ? "not-allowed" : "pointer" }}>
                    Reject
                  </button>
                </span>
              )}
            </IntentRow>
          ))}
        </div>
      )}
    </div>
  );
}
