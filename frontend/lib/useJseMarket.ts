"use client";

/**
 * Live-feeling JSE simulation. Drifts the snapshot prices on a timer so the market
 * actually moves — that's the point of a simulation. Heat scales the volatility, so
 * Gordon's "too hot" stocks visibly swing more than the "cool" ones.
 *
 * Still MOCK_MVP_PAPER_TRADING_ONLY — a local random walk, no live market calls.
 * Initial state is deterministic (no randomness) so server and client render match.
 */

import { useEffect, useState } from "react";
import { JSE_STOCKS, type JseStock } from "./jseMarket";
import { simulatedJseData, type JseDataMode } from "./jseDataAdapter";

interface Live extends JseStock {
  open: number; // session-open price, so `change` is measured from it
}

const TICK_MS = 3500;

function seed(): Live[] {
  // open price implied by the snapshot's starting day-change (deterministic).
  return simulatedJseData().stocks.map((s) => ({ ...s, open: s.price / (1 + s.change / 100) }));
}

function drift(s: Live): Live {
  const vol = (s.heat / 100) * 0.006; // hotter stock → bigger steps
  const shock = (Math.random() * 2 - 1) * vol; // random walk
  const revert = ((s.open - s.price) / s.open) * 0.02; // gentle pull toward open
  const price = Math.max(0.01, s.price * (1 + shock + revert));
  const change = (price / s.open - 1) * 100;
  return { ...s, price, change };
}

export function useJseMarket(): { stocks: JseStock[]; updatedAt: number; mode: JseDataMode; confidence: string } {
  const [stocks, setStocks] = useState<Live[]>(seed);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [mode, setMode] = useState<JseDataMode>("simulated");
  const [confidence, setConfidence] = useState(simulatedJseData().confidence);

  useEffect(() => {
    let cancelled = false;

    function refreshSimulationSource() {
      const result = simulatedJseData();
      if (cancelled) return;
      setMode(result.mode);
      setConfidence(result.confidence);
      setUpdatedAt(result.updatedAt);
    }

    refreshSimulationSource();
    const driftTimer = setInterval(() => {
      setStocks((prev) => prev.map(drift));
      setUpdatedAt(Date.now());
    }, TICK_MS);

    return () => {
      cancelled = true;
      clearInterval(driftTimer);
    };
  }, []);

  return { stocks, updatedAt, mode, confidence };
}
