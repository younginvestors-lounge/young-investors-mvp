/**
 * Simulated JSE data adapter.
 *
 * The MVP is MOCK_MVP_PAPER_TRADING_ONLY. Do not make browser-side calls to quote
 * providers or external market feeds from this demo. A future live/verified market
 * data integration must go behind an approved server adapter with clear disclosure,
 * permissions, provider terms, and failure handling.
 */

import { JSE_STOCKS, type JseStock } from "./jseMarket";

export type JseDataMode = "simulated";

export interface JseDataResult {
  mode: JseDataMode;
  stocks: JseStock[];
  updatedAt: number;
  confidence: string;
}

const SIM_CONFIDENCE = "Simulated quote feed - no external market data calls";

function withConfidence(stocks: JseStock[], confidence: string, updatedAt: number): JseStock[] {
  return stocks.map((stock) => ({
    ...stock,
    quoteSource: "simulated",
    quoteConfidence: confidence,
    quoteUpdatedAt: updatedAt,
  }));
}

export function simulatedJseData(): JseDataResult {
  const updatedAt = Date.now();
  return {
    mode: "simulated",
    stocks: withConfidence(JSE_STOCKS, SIM_CONFIDENCE, updatedAt),
    updatedAt,
    confidence: SIM_CONFIDENCE,
  };
}

export async function fetchJseData(): Promise<JseDataResult> {
  return simulatedJseData();
}
