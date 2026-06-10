/**
 * JSE market reference — a SIMULATED snapshot of JSE Top-40 members, in Rand.
 *
 * For now this is a mock snapshot (MOCK_MVP_PAPER_TRADING_ONLY — no live market
 * calls; our hard guardrail). It gives chefs a real sense of "what's on the menu"
 * on the JSE, with Gordon's heat-check per stock — how spicy it is, and what that
 * means for you. Live PUBLIC market data can be wired later behind a production
 * review; until then, every figure here is clearly labelled simulated.
 */

import {
  glossaryForHeatCheck,
  glossaryKeysForHeatCheck,
  SHOP_STOCK_HEAT_CHECK_CONCEPTS,
  type GlossaryEntry,
  type GordonHeatCheckConcept,
} from "./gordonGlossary";

export interface JseStock {
  symbol: string; // e.g. "NPN.JO"
  name: string;
  sector: string;
  price: number; // ZAR (simulated snapshot)
  change: number; // % on the (simulated) day
  heatCheckConcepts?: GordonHeatCheckConcept[];
  quoteSource?: "simulated" | "public" | "fallback";
  quoteConfidence?: string;
  quoteUpdatedAt?: number;
  heat: number; // Gordon's risk read, 0–100
}

export interface GordonCompanyHistoryMemory {
  symbol: string;
  companyName: string;
  sector: string;
  mandate: "JSE_TOP_40_CONSTITUENT_HISTORY";
  executionMode: "MOCK_MVP_PAPER_TRADING_ONLY";
  glossaryConcepts: GordonHeatCheckConcept[];
  glossaryKeys: string[];
  memoryScope: string;
  requiredHistoryInputs: string[];
  missingUntilDataAdapter: string[];
}

/** A simulated JSE Top-40 snapshot. Rand prices, fixed (a snapshot, not live). */
export const JSE_STOCKS: JseStock[] = [
  { symbol: "NPN.JO", name: "Naspers", sector: "Technology", price: 3250, change: 1.2, heat: 64 },
  { symbol: "PRX.JO", name: "Prosus", sector: "Technology", price: 520, change: 0.9, heat: 62 },
  { symbol: "MTN.JO", name: "MTN Group", sector: "Telecoms", price: 110, change: -1.4, heat: 71 },
  { symbol: "VOD.JO", name: "Vodacom", sector: "Telecoms", price: 98, change: 0.3, heat: 48 },
  { symbol: "SOL.JO", name: "Sasol", sector: "Energy & Chemicals", price: 145, change: -2.1, heat: 78 },
  { symbol: "SBK.JO", name: "Standard Bank", sector: "Banks", price: 195, change: 0.6, heat: 41 },
  { symbol: "FSR.JO", name: "FirstRand", sector: "Banks", price: 68, change: 0.4, heat: 39 },
  { symbol: "NED.JO", name: "Nedbank", sector: "Banks", price: 235, change: 0.2, heat: 42 },
  { symbol: "ABG.JO", name: "Absa Group", sector: "Banks", price: 165, change: -0.3, heat: 44 },
  { symbol: "CPI.JO", name: "Capitec", sector: "Banks", price: 2150, change: 1.1, heat: 55 },
  { symbol: "AGL.JO", name: "Anglo American", sector: "Diversified Mining", price: 520, change: -1.8, heat: 73 },
  { symbol: "BHG.JO", name: "BHP Group", sector: "Diversified Mining", price: 480, change: -1.1, heat: 66 },
  { symbol: "ANG.JO", name: "AngloGold Ashanti", sector: "Gold", price: 380, change: 2.4, heat: 76 },
  { symbol: "GFI.JO", name: "Gold Fields", sector: "Gold", price: 245, change: 2.0, heat: 74 },
  { symbol: "IMP.JO", name: "Impala Platinum", sector: "Platinum", price: 95, change: -3.0, heat: 82 },
  { symbol: "AMS.JO", name: "Anglo American Platinum", sector: "Platinum", price: 640, change: -2.2, heat: 80 },
  { symbol: "SSW.JO", name: "Sibanye-Stillwater", sector: "Platinum & Gold", price: 22, change: -3.6, heat: 85 },
  { symbol: "BTI.JO", name: "British American Tobacco", sector: "Consumer Staples", price: 610, change: 0.5, heat: 46 },
  { symbol: "SHP.JO", name: "Shoprite", sector: "Food Retail", price: 265, change: 0.8, heat: 40 },
  { symbol: "WHL.JO", name: "Woolworths", sector: "Retail", price: 62, change: -0.6, heat: 49 },
  { symbol: "CLS.JO", name: "Clicks Group", sector: "Health Retail", price: 310, change: 0.7, heat: 38 },
  { symbol: "MRP.JO", name: "Mr Price Group", sector: "Apparel Retail", price: 195, change: -0.9, heat: 52 },
  { symbol: "DSY.JO", name: "Discovery", sector: "Insurance", price: 135, change: 0.4, heat: 53 },
  { symbol: "SLM.JO", name: "Sanlam", sector: "Insurance", price: 78, change: 0.3, heat: 45 },
  { symbol: "REM.JO", name: "Remgro", sector: "Investment Holding", price: 155, change: 0.1, heat: 43 },
  { symbol: "BVT.JO", name: "Bidvest", sector: "Industrials", price: 270, change: 0.6, heat: 47 },
  { symbol: "GRT.JO", name: "Growthpoint Properties", sector: "Property (REIT)", price: 13, change: -0.4, heat: 50 },
  { symbol: "CFR.JO", name: "Richemont", sector: "Luxury Goods", price: 2800, change: 1.0, heat: 58 },
  { symbol: "BID.JO", name: "Bid Corporation", sector: "Industrials", price: 430, change: 0.5, heat: 45 },
  { symbol: "APN.JO", name: "Aspen Pharmacare", sector: "Healthcare", price: 190, change: -1.2, heat: 60 },
  { symbol: "SPP.JO", name: "Spar Group", sector: "Food Retail", price: 115, change: 0.2, heat: 51 },
  { symbol: "TFG.JO", name: "The Foschini Group", sector: "Apparel Retail", price: 130, change: -0.7, heat: 54 },
  { symbol: "TBS.JO", name: "Tiger Brands", sector: "Food Producers", price: 210, change: 0.3, heat: 47 },
  { symbol: "EXX.JO", name: "Exxaro Resources", sector: "Coal Mining", price: 165, change: -1.9, heat: 72 },
  { symbol: "KIO.JO", name: "Kumba Iron Ore", sector: "Iron Ore", price: 380, change: -2.4, heat: 75 },
  { symbol: "ARI.JO", name: "African Rainbow Minerals", sector: "Diversified Mining", price: 195, change: -1.6, heat: 70 },
  { symbol: "OMU.JO", name: "Old Mutual", sector: "Insurance", price: 12, change: 0.2, heat: 50 },
  { symbol: "INL.JO", name: "Investec", sector: "Banks", price: 125, change: 0.5, heat: 48 },
  { symbol: "NRP.JO", name: "NEPI Rockcastle", sector: "Property (REIT)", price: 120, change: 0.4, heat: 49 },
  { symbol: "MNP.JO", name: "Mondi", sector: "Paper & Packaging", price: 380, change: -0.8, heat: 56 },
  { symbol: "RNI.JO", name: "Reinet Investments", sector: "Investment Holding", price: 420, change: 0.3, heat: 44 },
];

export const JSE_TOP_40_HISTORY_MEMORY_SCOPE =
  "Gordon knows each listed JSE Top 40 constituent as a company-history subject: listing context, adjusted open/close history, trend regimes, drawdowns, price gaps, market shocks, and public news catalysts. In this MVP the stock universe and prices are simulated; full history requires a licensed market-data and news/SENS adapter.";

export const JSE_TOP_40_HISTORY_REQUIRED_INPUTS = [
  "licensed adjusted daily OHLC history from listing or earliest reliable availability",
  "corporate actions: splits, consolidations, dividends, unbundlings, name changes, and ticker changes",
  "index membership windows and benchmark weights for JSE Top 40 context",
  "public company announcements, SENS releases, earnings dates, macro events, commodity shocks, and regulatory context",
  "source provenance, timestamps, licensing status, and confidence score for every historical event",
];

export const JSE_TOP_40_HISTORY_MISSING_UNTIL_DATA_ADAPTER = [
  "verified inception/listing-date price history",
  "licensed historical open and close records",
  "verified public-news shock timeline",
  "corporate-action-adjusted total-return series",
  "auditable data confidence per company and event",
];

export function gordonHistoryMemoryForStock(stock: JseStock): GordonCompanyHistoryMemory {
  const glossaryConcepts = stock.heatCheckConcepts ?? SHOP_STOCK_HEAT_CHECK_CONCEPTS;

  return {
    symbol: stock.symbol,
    companyName: stock.name,
    sector: stock.sector,
    mandate: "JSE_TOP_40_CONSTITUENT_HISTORY",
    executionMode: "MOCK_MVP_PAPER_TRADING_ONLY",
    glossaryConcepts,
    glossaryKeys: glossaryKeysForHeatCheck(glossaryConcepts),
    memoryScope: JSE_TOP_40_HISTORY_MEMORY_SCOPE,
    requiredHistoryInputs: JSE_TOP_40_HISTORY_REQUIRED_INPUTS,
    missingUntilDataAdapter: JSE_TOP_40_HISTORY_MISSING_UNTIL_DATA_ADAPTER,
  };
}

export function glossaryForStockHeatCheck(stock?: JseStock): GlossaryEntry[] {
  return glossaryForHeatCheck(stock?.heatCheckConcepts ?? SHOP_STOCK_HEAT_CHECK_CONCEPTS);
}

export const GORDON_JSE_TOP_40_HISTORY_MEMORY = JSE_STOCKS.map(gordonHistoryMemoryForStock);

export const HOT_THRESHOLD = 70;
export const WARM_THRESHOLD = 50;

export function heatTier(heat: number): { label: string; color: string } {
  if (heat >= HOT_THRESHOLD) return { label: "Too hot", color: "#b42318" };
  if (heat >= WARM_THRESHOLD) return { label: "Warm", color: "#b46918" };
  return { label: "Cool", color: "#167a3a" };
}

/** Gordon's "what this means for you" line, derived from heat + sector. Plain + a little slang. */
export function heatMeaning(stock: JseStock): string {
  if (stock.heat >= HOT_THRESHOLD) {
    return `High heat. ${stock.name} swings hard — ${stock.sector.toLowerCase()} moves fast. Size it small or it'll burn your plate. Not a beginner's first cook, no cap.`;
  }
  if (stock.heat >= WARM_THRESHOLD) {
    return `Medium heat. ${stock.name} has real moves in it. There's flavour here, but keep the portion measured — don't let one plate get too heavy.`;
  }
  return `Lower heat. ${stock.name} is one of the steadier plates — calmer day-to-day. Steady doesn't mean safe, though; still size it with care.`;
}

export function formatRand(price: number): string {
  return `R${price.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Search by symbol, name, or sector. */
export function searchStocks(query: string): JseStock[] {
  const q = query.trim().toLowerCase();
  if (!q) return JSE_STOCKS;
  return JSE_STOCKS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.sector.toLowerCase().includes(q)
  );
}
