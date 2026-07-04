"use client";

import type { ShelfDecision } from "@/lib/shelfStore";

export type TerminalEventKind =
  | "shelf_receipt"
  | "shelf_removed"
  | "shelf_cleared"
  | "recipe_submitted"
  | "vote_cast"
  | "paper_execution";

export type TerminalLedgerLayer = "personal_vault" | "kitchen_vault" | "public_terminal";
export type TerminalLedgerVisibility = "private" | "concealed" | "public";

export interface TerminalLedgerLine {
  layer: TerminalLedgerLayer;
  account: string;
  movement: "memo" | "debit" | "credit";
  amount: number | null;
  unit: "ZAR" | "VOTE" | "RECEIPT";
  visibility: TerminalLedgerVisibility;
  note: string;
}

export type TerminalReceiptFaceKey = "personal_chef" | "kitchen" | "public_ledger";

export interface TerminalReceiptFace {
  face: TerminalReceiptFaceKey;
  title: string;
  visibility: TerminalLedgerVisibility;
  summary: string;
  visibleFields: string[];
  concealedFields: string[];
}

export interface TerminalReceipt {
  statementType: "MOCK_TRIPLE_LEDGER_ACCOUNTING_RECEIPT";
  publicRef: string;
  concealedKitchenRef: "KITCHEN_IDENTITY_CONCEALED";
  commitment: string;
  publicVisibleAt: number;
  reconciliationDelayMs: number;
  immutable: true;
  faces: {
    personalChef: TerminalReceiptFace;
    kitchen: TerminalReceiptFace;
    publicLedger: TerminalReceiptFace;
  };
  layers: TerminalLedgerLine[];
}

export interface TerminalEvent {
  id: string;
  kind: TerminalEventKind;
  title: string;
  line: string;
  ticker?: string;
  side?: ShelfDecision | "FOR" | "AGAINST" | "ABSTAIN";
  amount?: number | null;
  status: "pending" | "approved" | "rejected" | "paper" | "info";
  createdAt: number;
  mode: "MOCK_MVP_PAPER_TRADING_ONLY";
  receipt: TerminalReceipt;
}

export type TerminalEventRecord = Omit<TerminalEvent, "receipt"> & { receipt?: TerminalReceipt };

const TERMINAL_KEY = "yi_transaction_terminal";
export const TERMINAL_EVENT = "yi:terminal-updated";
export const MAX_TERMINAL_EVENTS = 240;
export const PUBLIC_LEDGER_RECONCILIATION_DELAY_MS = 5 * 60 * 1000;

function mockCommitment(seed: string): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `mock-commitment-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function lineAmount(event: Pick<TerminalEvent, "kind" | "amount">): number | null {
  if (event.kind === "vote_cast") return 1;
  return event.amount ?? null;
}

function publicDecisionLabel(event: Pick<TerminalEvent, "kind" | "ticker" | "side" | "status">): string {
  const ticker = event.ticker ?? "NO_TICKER";
  if (event.kind === "vote_cast") return `Anonymous vote on ${ticker}: ${event.side ?? "CAST"}`;
  if (event.kind === "paper_execution") return `Kitchen-approved paper execution on ${ticker}`;
  if (event.kind === "recipe_submitted") return `Kitchen proposal opened on ${ticker}`;
  if (event.kind === "shelf_receipt") return `Anonymous paper intent recorded on ${ticker}`;
  return `Public paper ledger event: ${event.status}`;
}

export function createTerminalReceipt(event: Pick<TerminalEvent, "id" | "kind" | "ticker" | "side" | "amount" | "status" | "createdAt">): TerminalReceipt {
  const seed = [event.id, event.kind, event.ticker ?? "NO_TICKER", event.side ?? "NO_SIDE", event.amount ?? "NO_AMOUNT", event.status, event.createdAt].join("|");
  const commitment = mockCommitment(seed);
  const publicRef = `YI-PUB-${commitment.slice(-8).toUpperCase()}`;
  const amount = lineAmount(event);
  const voteUnit = event.kind === "vote_cast";

  return {
    statementType: "MOCK_TRIPLE_LEDGER_ACCOUNTING_RECEIPT",
    publicRef,
    concealedKitchenRef: "KITCHEN_IDENTITY_CONCEALED",
    commitment,
    publicVisibleAt: event.createdAt + PUBLIC_LEDGER_RECONCILIATION_DELAY_MS,
    reconciliationDelayMs: PUBLIC_LEDGER_RECONCILIATION_DELAY_MS,
    immutable: true,
    faces: {
      personalChef: {
        face: "personal_chef",
        title: "Personal Chef receipt",
        visibility: "private",
        summary: "Detailed private accounting reflection for the chef to recall what happened.",
        visibleFields: ["chef source record", "decision", "ticker", "paper amount", "timestamp", "private reasoning when captured"],
        concealedFields: ["other chefs' identities", "Kitchen-only member data"],
      },
      kitchen: {
        face: "kitchen",
        title: "Kitchen receipt",
        visibility: "concealed",
        summary: "Kitchen-member accounting subset for the proposal, vote, Vault movement, and 60% governance state.",
        visibleFields: ["Kitchen-scoped decision", "ticker", "paper amount", "vote state", "Vault effect", "timestamp"],
        concealedFields: ["chef identity outside the Kitchen", "personal profile data", "private personal reasoning"],
      },
      publicLedger: {
        face: "public_ledger",
        title: "Public ledger receipt",
        visibility: "public",
        summary: publicDecisionLabel(event),
        visibleFields: ["public reference", "decision category", "ticker", "timestamp", "mock commitment"],
        concealedFields: ["chef identity", "Kitchen identity", "personal reasoning", "member roster", "private Vault data"],
      },
    },
    layers: [
      {
        layer: "personal_vault",
        account: voteUnit ? "PERSONAL_VOTE_STATEMENT" : "PERSONAL_SHELF_OR_VAULT_STATEMENT",
        movement: "memo",
        amount,
        unit: voteUnit ? "VOTE" : "ZAR",
        visibility: "private",
        note: "Chef-facing paper balance statement.",
      },
      {
        layer: "kitchen_vault",
        account: "CONCEALED_KITCHEN_ACCOUNTING_LEDGER",
        movement: event.status === "rejected" ? "memo" : event.status === "approved" || event.status === "paper" ? "credit" : "memo",
        amount,
        unit: voteUnit ? "VOTE" : "ZAR",
        visibility: "concealed",
        note: "Kitchen identity is concealed before public publication.",
      },
      {
        layer: "public_terminal",
        account: "PUBLIC_TERMINAL_COMMITMENT",
        movement: "memo",
        amount,
        unit: voteUnit ? "VOTE" : event.kind === "shelf_cleared" ? "RECEIPT" : "ZAR",
        visibility: "public",
        note: "Append-only mock commitment for future public ledger or blockchain adapter.",
      },
    ],
  };
}

export function withTerminalReceipt(event: TerminalEventRecord): TerminalEvent {
  return event.receipt?.faces && typeof event.receipt.publicVisibleAt === "number"
    ? event as TerminalEvent
    : { ...event, receipt: createTerminalReceipt(event) };
}

export function isPublicLedgerVisible(event: TerminalEvent, now = Date.now()): boolean {
  return now >= event.receipt.publicVisibleAt;
}

function isTerminalEvent(item: unknown): item is TerminalEventRecord {
  const row = item as Partial<TerminalEventRecord>;
  return Boolean(row?.id && row?.kind && row?.title && row?.createdAt);
}

function readRaw(): TerminalEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TERMINAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isTerminalEvent).map(withTerminalReceipt) : [];
  } catch {
    return [];
  }
}

function writeRaw(events: TerminalEvent[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TERMINAL_KEY, JSON.stringify(events.slice(0, MAX_TERMINAL_EVENTS)));
  window.dispatchEvent(new Event(TERMINAL_EVENT));
}

export function readTerminalEvents(): TerminalEvent[] {
  return readRaw();
}

type TerminalEventInput = Omit<TerminalEvent, "id" | "createdAt" | "mode" | "receipt"> & {
  id?: string;
  createdAt?: number;
  receipt?: TerminalReceipt;
};

export function appendTerminalEvent(input: TerminalEventInput): TerminalEvent {
  const id = input.id ?? `term-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = input.createdAt ?? Date.now();
  const event = withTerminalReceipt({
    ...input,
    id,
    createdAt,
    mode: "MOCK_MVP_PAPER_TRADING_ONLY",
    receipt: input.receipt ?? createTerminalReceipt({ ...input, id, createdAt }),
  });
  const existing = readRaw().filter((item) => item.id !== event.id);
  writeRaw([event, ...existing]);
  return event;
}
