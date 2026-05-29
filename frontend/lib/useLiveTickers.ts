"use client";

import type { MarketTicker } from "./types";

/**
 * Returns the fallback mock tickers unchanged.
 * No external requests — MOCK_MVP_PAPER_TRADING_ONLY.
 */
export function useLiveTickers(fallback: MarketTicker[]) {
  return { tickers: fallback, live: false };
}
