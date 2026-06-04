/**
 * Optional JSE quote adapter.
 *
 * Default demo mode stays simulated. If NEXT_PUBLIC_JSE_QUOTES_URL is configured,
 * the client can read a PUBLIC quote JSON endpoint/proxy and merge the latest
 * prices into the simulated JSE universe. No API key is read here: browser code must
 * never carry secrets. If a provider needs a key, put it behind a server/proxy route.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY - market data only, never order routing.
 */

import { JSE_STOCKS, type JseStock } from "./jseMarket";

export type JseDataMode = "simulated" | "public" | "fallback";

export interface JseQuote {
  symbol: string;
  price: number;
  change?: number;
  updatedAt?: number;
}

export interface JseDataResult {
  mode: JseDataMode;
  stocks: JseStock[];
  updatedAt: number;
  confidence: string;
}

const QUOTE_URL = process.env.NEXT_PUBLIC_JSE_QUOTES_URL?.trim() || "";
const PUBLIC_CONFIDENCE = "Public quote endpoint - unverified demo feed; history remains simulated";
const SIM_CONFIDENCE = "Simulated quote fallback - no public quote endpoint configured";
const FALLBACK_CONFIDENCE = "Simulated quote fallback - public quote endpoint unavailable";

export function jseQuoteEndpointConfigured(): boolean {
  return QUOTE_URL.length > 0;
}

function normaliseSymbol(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  return clean.endsWith(".JO") ? clean : `${clean}.JO`;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readQuote(raw: Record<string, unknown>, fallbackSymbol?: string): JseQuote | null {
  const rawSymbol = raw.symbol ?? raw.ticker ?? raw.code ?? fallbackSymbol;
  if (typeof rawSymbol !== "string") return null;

  const price = asNumber(raw.price ?? raw.last ?? raw.close ?? raw.lastPrice ?? raw.value);
  if (price == null || price <= 0) return null;

  const change = asNumber(raw.changePercent ?? raw.changePct ?? raw.change ?? raw.percentChange);
  const timestamp =
    asNumber(raw.updatedAt ?? raw.timestamp ?? raw.time) ??
    (typeof raw.date === "string" ? Date.parse(raw.date) : null);

  return {
    symbol: normaliseSymbol(rawSymbol),
    price,
    change: change ?? undefined,
    updatedAt: timestamp && Number.isFinite(timestamp) ? timestamp : undefined,
  };
}

function parseQuotes(payload: unknown): JseQuote[] {
  const rows: JseQuote[] = [];

  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (item && typeof item === "object") {
        const quote = readQuote(item as Record<string, unknown>);
        if (quote) rows.push(quote);
      }
    }
    return rows;
  }

  if (!payload || typeof payload !== "object") return rows;
  const obj = payload as Record<string, unknown>;
  const nested = obj.quotes ?? obj.data ?? obj.results ?? obj.items;
  if (Array.isArray(nested)) return parseQuotes(nested);

  for (const [symbol, value] of Object.entries(obj)) {
    if (value && typeof value === "object") {
      const quote = readQuote(value as Record<string, unknown>, symbol);
      if (quote) rows.push(quote);
    }
  }

  return rows;
}

function withConfidence(stocks: JseStock[], mode: JseDataMode, confidence: string, updatedAt: number): JseStock[] {
  return stocks.map((stock) => ({
    ...stock,
    quoteSource: mode === "public" ? "public" : mode === "fallback" ? "fallback" : "simulated",
    quoteConfidence: confidence,
    quoteUpdatedAt: updatedAt,
  }));
}

export function simulatedJseData(mode: JseDataMode = "simulated", confidence = SIM_CONFIDENCE): JseDataResult {
  const updatedAt = Date.now();
  return {
    mode,
    stocks: withConfidence(JSE_STOCKS, mode, confidence, updatedAt),
    updatedAt,
    confidence,
  };
}

export function mergeJseQuotes(stocks: JseStock[], quotes: JseQuote[], updatedAt = Date.now()): JseStock[] {
  const bySymbol = new Map(quotes.map((quote) => [normaliseSymbol(quote.symbol), quote]));

  return stocks.map((stock) => {
    const quote = bySymbol.get(normaliseSymbol(stock.symbol));
    if (!quote) {
      return {
        ...stock,
        quoteSource: "fallback",
        quoteConfidence: "No public quote for this symbol - simulated fallback",
        quoteUpdatedAt: updatedAt,
      };
    }

    return {
      ...stock,
      price: quote.price,
      change: quote.change ?? stock.change,
      quoteSource: "public",
      quoteConfidence: PUBLIC_CONFIDENCE,
      quoteUpdatedAt: quote.updatedAt ?? updatedAt,
    };
  });
}

function quoteRequestUrl(symbols: string[]): string {
  const url = new URL(QUOTE_URL, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  if (!url.searchParams.has("symbols")) {
    url.searchParams.set("symbols", symbols.join(","));
  }
  return url.toString();
}

export async function fetchJseData(): Promise<JseDataResult> {
  if (!jseQuoteEndpointConfigured()) return simulatedJseData();

  const updatedAt = Date.now();
  try {
    const response = await fetch(quoteRequestUrl(JSE_STOCKS.map((stock) => stock.symbol)), {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Quote endpoint returned ${response.status}`);

    const quotes = parseQuotes(await response.json());
    if (quotes.length === 0) throw new Error("Quote endpoint returned no usable JSE quotes");

    return {
      mode: "public",
      stocks: mergeJseQuotes(JSE_STOCKS, quotes, updatedAt),
      updatedAt,
      confidence: PUBLIC_CONFIDENCE,
    };
  } catch {
    return simulatedJseData("fallback", FALLBACK_CONFIDENCE);
  }
}
