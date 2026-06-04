/**
 * Simulated company history from inception — the data Gordon "reads" to decide.
 *
 * We have no licensed market feed (see GordonCompanyHistoryMemory in jseMarket.ts,
 * which is explicitly flagged "requires-licensed-data-adapter"). So Gordon's heat
 * check is computed from a DETERMINISTIC SIMULATED price path per company (geometric
 * Brownian motion seeded by the symbol, scaled to today's snapshot price). It is
 * stable — same company, same story — and clearly labelled SIMULATED, never verified
 * history. Gordon then computes real statistics from it: CAGR, annualised volatility,
 * max drawdown, drawdown-from-high, and trend regime — and his heat check follows.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — simulated, educational, never financial advice.
 */

import { JSE_STOCKS, type JseStock } from "./jseMarket";

const NOW_YEAR = 2026;

/* ── deterministic PRNG (so the "history" is stable per company) ── */
function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rng: () => number): number {
  // Box–Muller
  const u = Math.max(1e-9, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ── types ── */
export interface PricePoint {
  year: number;
  price: number;
}
export interface HistoryStats {
  inceptionYear: number;
  years: number;
  inceptionPrice: number;
  currentPrice: number;
  allTimeHigh: number;
  cagrPct: number;
  annualVolPct: number;
  maxDrawdownPct: number;
  drawdownFromHighPct: number;
  trend: "up" | "down" | "flat";
}
export interface CompanyHistory {
  symbol: string;
  points: PricePoint[]; // monthly resolution, but we down-sample for sparklines
  stats: HistoryStats;
}

/* ── per-company simulated history ── */
function listingYear(symbol: string): number {
  // Deterministic, plausible listing year (simulated) in 1990–2006.
  return 1990 + (hashSeed(symbol + "yr") % 17);
}

function buildHistory(stock: JseStock): CompanyHistory {
  const rng = mulberry32(hashSeed(stock.symbol));
  const inceptionYear = listingYear(stock.symbol);
  const years = NOW_YEAR - inceptionYear;
  const months = Math.max(24, years * 12);

  // Sector/quality-flavoured drift + heat-scaled volatility (annual).
  const sigma = 0.12 + (stock.heat / 100) * 0.42; // heat 40 → ~0.29, heat 85 → ~0.48
  const mu = 0.05 + (((hashSeed(stock.symbol + "mu") % 1000) / 1000) - 0.4) * 0.18; // ~ -0.02..+0.16
  const dt = 1 / 12;

  // Walk a unit path, then scale so the LAST point equals today's snapshot price.
  const raw: number[] = [1];
  for (let i = 1; i <= months; i++) {
    const z = gaussian(rng);
    const prev = raw[i - 1];
    const next = prev * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z);
    raw.push(Math.max(1e-6, next));
  }
  const scale = stock.price / raw[raw.length - 1];
  const monthly = raw.map((p) => p * scale);

  // Down-sample to yearly points for sparklines.
  const points: PricePoint[] = [];
  for (let i = 0; i < monthly.length; i += 12) {
    points.push({ year: inceptionYear + Math.floor(i / 12), price: monthly[i] });
  }
  if (points[points.length - 1]?.year !== NOW_YEAR) {
    points.push({ year: NOW_YEAR, price: stock.price });
  }

  // ── statistics from the (simulated) history ──
  const inceptionPrice = monthly[0];
  const currentPrice = stock.price;
  let ath = 0;
  let peak = monthly[0];
  let maxDD = 0;
  for (const p of monthly) {
    if (p > ath) ath = p;
    if (p > peak) peak = p;
    const dd = (p - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }
  // log-return vol (annualised)
  let sumSq = 0;
  let mean = 0;
  const rets: number[] = [];
  for (let i = 1; i < monthly.length; i++) {
    const r = Math.log(monthly[i] / monthly[i - 1]);
    rets.push(r);
    mean += r;
  }
  mean /= Math.max(1, rets.length);
  for (const r of rets) sumSq += (r - mean) * (r - mean);
  const monthlyVol = Math.sqrt(sumSq / Math.max(1, rets.length));
  const annualVolPct = monthlyVol * Math.sqrt(12) * 100;

  const cagrPct = (Math.pow(currentPrice / inceptionPrice, 1 / Math.max(1, years)) - 1) * 100;
  const drawdownFromHighPct = ((currentPrice - ath) / ath) * 100;

  // recent regime: last 12 months slope
  const recent = monthly.slice(-13);
  const slope = recent.length > 1 ? (recent[recent.length - 1] - recent[0]) / recent[0] : 0;
  const trend: HistoryStats["trend"] = slope > 0.05 ? "up" : slope < -0.05 ? "down" : "flat";

  return {
    symbol: stock.symbol,
    points,
    stats: {
      inceptionYear,
      years,
      inceptionPrice,
      currentPrice,
      allTimeHigh: ath,
      cagrPct,
      annualVolPct,
      maxDrawdownPct: maxDD * 100,
      drawdownFromHighPct,
      trend,
    },
  };
}

const cache = new Map<string, CompanyHistory>();
export function companyHistory(stock: JseStock): CompanyHistory {
  const hit = cache.get(stock.symbol);
  if (hit) return hit;
  const built = buildHistory(stock);
  cache.set(stock.symbol, built);
  return built;
}

/* ── Gordon's heat check, computed from the history stats ── */
export interface HeatDriver {
  label: string;
  value: string;
  /** 0–100 contribution, for the breakdown bar. */
  load: number;
}
export interface HeatCheck {
  score: number;
  tier: { label: string; color: string };
  drivers: HeatDriver[];
  meaning: string;
  trend: HistoryStats["trend"];
  confidence: string;
}

function tierFor(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Too hot", color: "#b42318" };
  if (score >= 50) return { label: "Warm", color: "#b46918" };
  return { label: "Cool", color: "#167a3a" };
}

/** Gordon reads the company's simulated history and decides how spicy it is. */
export function gordonHeatCheck(stock: JseStock): HeatCheck {
  const { stats } = companyHistory(stock);

  // Decision metrics → 0–100 loads.
  const volLoad = Math.min(100, stats.annualVolPct * 1.6); // 30% vol → 48, 60% → 96
  const ddLoad = Math.min(100, Math.abs(stats.maxDrawdownPct) * 1.1); // 60% DD → 66
  const fallLoad = Math.min(100, Math.max(0, -stats.drawdownFromHighPct) * 1.4); // far below ATH = riskier entry
  const trendLoad = stats.trend === "down" ? 70 : stats.trend === "flat" ? 45 : 30;

  const score = Math.round(
    Math.max(0, Math.min(100, volLoad * 0.4 + ddLoad * 0.25 + fallLoad * 0.2 + trendLoad * 0.15))
  );
  const tier = tierFor(score);

  const drivers: HeatDriver[] = [
    { label: "Volatility", value: `${stats.annualVolPct.toFixed(0)}%/yr`, load: volLoad },
    { label: "Max drawdown", value: `${stats.maxDrawdownPct.toFixed(0)}%`, load: ddLoad },
    { label: "Below all-time high", value: `${stats.drawdownFromHighPct.toFixed(0)}%`, load: fallLoad },
    { label: "Recent trend", value: stats.trend, load: trendLoad },
  ];

  const falling = stats.drawdownFromHighPct < -15;
  let meaning: string;
  if (score >= 70) {
    meaning = `Gordon reads ${stats.years}+ years of history: ~${stats.annualVolPct.toFixed(0)}% volatility, a worst fall of ${Math.abs(stats.maxDrawdownPct).toFixed(0)}%${falling ? ", and it's well below its high right now" : ""}. Too hot — size it small or it burns your plate.`;
  } else if (score >= 50) {
    meaning = `From inception, ${stock.name} runs ~${stats.annualVolPct.toFixed(0)}% volatility and has taken ${Math.abs(stats.maxDrawdownPct).toFixed(0)}% drawdowns. Warm — real moves in it, so keep the portion measured.`;
  } else {
    meaning = `History says ${stock.name} is steadier: ~${stats.annualVolPct.toFixed(0)}% volatility, shallower drawdowns. Cool — calmer, but steady isn't safe. Still size with care.`;
  }

  return {
    score,
    tier,
    drivers,
    meaning,
    trend: stats.trend,
    confidence: "Simulated history · not licensed/verified market data",
  };
}

export const ALL_HEAT_CHECKS: Record<string, HeatCheck> = Object.fromEntries(
  JSE_STOCKS.map((s) => [s.symbol, gordonHeatCheck(s)])
);
