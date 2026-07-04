"use client";

import type { JseStock } from "@/lib/jseMarket";
import { appendTerminalEvent } from "@/lib/transactionTerminal";

export type ShelfDecision = "BUY" | "SELL" | "HOLD";

export interface ShelfReceipt {
  id: string;
  createdAt: number;
  symbol: string;
  name: string;
  sector: string;
  decision: ShelfDecision;
  price: number;
  weightPercent: number;
  units: number;
  notional: number;
  reason: string;
  mode: "MOCK_MVP_PAPER_TRADING_ONLY";
}

const SHELF_KEY = "yi_shelf_receipts";
export const SHELF_EVENT = "yi:shelf-updated";
export const MAX_SHELF_RECEIPTS = 10;

function readRaw(): ShelfReceipt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SHELF_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is ShelfReceipt => Boolean(item?.id && item?.symbol)) : [];
  } catch {
    return [];
  }
}

function writeRaw(receipts: ShelfReceipt[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHELF_KEY, JSON.stringify(receipts.slice(0, MAX_SHELF_RECEIPTS)));
  window.dispatchEvent(new Event(SHELF_EVENT));
}

export function readShelfReceipts(): ShelfReceipt[] {
  return readRaw();
}

export function addShelfReceipt(input: {
  stock: JseStock;
  decision: ShelfDecision;
  weightPercent: number;
  reason: string;
}): ShelfReceipt {
  const notional = Math.round(1001 * (input.weightPercent / 100) * 100) / 100;
  const units = input.stock.price > 0 ? Number((notional / input.stock.price).toFixed(4)) : 0;
  const receipt: ShelfReceipt = {
    id: `shelf-${Date.now()}-${input.stock.symbol}`,
    createdAt: Date.now(),
    symbol: input.stock.symbol,
    name: input.stock.name,
    sector: input.stock.sector,
    decision: input.decision,
    price: input.stock.price,
    weightPercent: input.weightPercent,
    units,
    notional,
    reason: input.reason.trim() || "Shelf decision from Gordon heat check.",
    mode: "MOCK_MVP_PAPER_TRADING_ONLY",
  };
  const existing = readRaw().filter((item) => item.symbol !== receipt.symbol);
  writeRaw([receipt, ...existing]);
  appendTerminalEvent({
    kind: "shelf_receipt",
    title: "Personal ledger receipt",
    line: `${receipt.decision} ${receipt.symbol} / ${receipt.weightPercent}% paper plate statement`,
    ticker: receipt.symbol,
    side: receipt.decision,
    amount: receipt.notional,
    status: "pending",
    id: `shelf-create-${receipt.id}`,
    createdAt: receipt.createdAt,
  });
  return receipt;
}

export function removeShelfReceipt(id: string): void {
  const existing = readRaw();
  const receipt = existing.find((item) => item.id === id);
  writeRaw(existing.filter((item) => item.id !== id));
  if (receipt) {
    appendTerminalEvent({
      kind: "shelf_removed",
      title: "Receipt moved to Kitchen",
      line: `${receipt.symbol} moved from personal ledger into concealed Kitchen accounting`,
      ticker: receipt.symbol,
      side: receipt.decision,
      amount: receipt.notional,
      status: "info",
      id: `shelf-remove-${receipt.id}`,
    });
  }
}

export function clearShelfReceipts(): void {
  const count = readRaw().length;
  writeRaw([]);
  if (count > 0) {
    appendTerminalEvent({
      kind: "shelf_cleared",
      title: "Personal shelf cleared",
      line: `${count} local paper receipt${count !== 1 ? "s" : ""} cleared from the personal view`,
      status: "info",
    });
  }
}
