"use client";

import { useEffect, useMemo, useState } from "react";
import { AcademyView } from "@/components/AcademyView";
import { BottomNav } from "@/components/BottomNav";
import { BrutalistHeader } from "@/components/BrutalistHeader";
import { KitchenGordonPanel } from "@/components/KitchenGordonPanel";
import { KitchenView } from "@/components/KitchenView";
import { LoungeView } from "@/components/LoungeView";
import { ShopView } from "@/components/ShopView";
import { VaultView } from "@/components/VaultView";
import { getDashboardSnapshot } from "@/lib/api";
import { buildPatternDataURI } from "@/lib/pattern";
import {
  EXECUTION_MODE,
  type AcademyClearance,
  type AcademyModule,
  type BackgroundMode,
  type DashboardTab,
  type ThemeMode,
  type TradeProposal,
} from "@/lib/types";

export default function AppShell() {
  const seed = getDashboardSnapshot();

  const [activeTab, setActiveTab] = useState<DashboardTab>("academy");
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("solid");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [proposals, setProposals] = useState<TradeProposal[]>(seed.tradeProposals);
  const [modules, setModules] = useState<AcademyModule[]>(seed.academyModules);
  const [clearance, setClearance] = useState<AcademyClearance>(seed.academyClearance);

  // Read persisted preferences on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("yi_theme") as ThemeMode | null;
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = savedTheme ?? (systemDark ? "dark" : "light");
      setTheme(resolved);

      const savedBg = localStorage.getItem("yi_background") as BackgroundMode | null;
      if (savedBg) setBackgroundMode(savedBg);
    } catch {}
  }, []);

  // Sync theme → <html data-theme> + localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("yi_theme", theme); } catch {}
  }, [theme]);

  // Persist background preference
  useEffect(() => {
    try { localStorage.setItem("yi_background", backgroundMode); } catch {}
  }, [backgroundMode]);

  const patternUrl = useMemo(() => buildPatternDataURI(theme), [theme]);

  function handleVote(proposalId: string, vote: "YES" | "NO") {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const prevVote = p.userVote;
        const v = { ...p.votes };
        if (prevVote === "YES") v.yes -= 1;
        if (prevVote === "NO") v.no -= 1;
        if (prevVote === vote) return { ...p, userVote: null, votes: v };
        if (vote === "YES") v.yes += 1;
        if (vote === "NO") v.no += 1;
        return { ...p, userVote: vote, votes: v };
      })
    );
  }

  function handleModuleStart(moduleId: string) {
    setModules((prev) => {
      const updated = prev.map((m) =>
        m.id === moduleId && !m.locked && !m.passed ? { ...m, passed: true } : m
      );
      let unlockDone = false;
      return updated.map((m) => {
        if (m.locked && !unlockDone) {
          unlockDone = true;
          return { ...m, locked: false };
        }
        return m;
      });
    });

    setClearance((prev) => {
      if (prev.passedModuleIds.includes(moduleId)) return prev;
      const newPassed = [...prev.passedModuleIds, moduleId];
      const newMissing = prev.missingModuleIds.filter((id) => id !== moduleId);
      return {
        ...prev,
        passedModuleIds: newPassed,
        missingModuleIds: newMissing,
        complete: newMissing.length === 0,
      };
    });
  }

  return (
    <div className="dashboard-shell">
      {backgroundMode === "pattern" && (
        <div
          className="pattern-overlay"
          style={{ backgroundImage: `url("${patternUrl}")` }}
        />
      )}

      <main className="dashboard-main">
        <BrutalistHeader
          activeTab={activeTab}
          executionMode={EXECUTION_MODE}
          backgroundMode={backgroundMode}
          onBackgroundModeChange={setBackgroundMode}
          theme={theme}
          onThemeChange={setTheme}
        />

        <KitchenGordonPanel
          clearance={clearance}
          modules={modules}
          portfolio={seed.portfolio}
          proposals={proposals}
        />

        {activeTab === "kitchen" && (
          <section className="stack" style={{ padding: "48px 0 32px", alignItems: "flex-start" }}>
            <div>
              <p className="eyebrow" style={{ color: "#b42318" }}>Demo mode · locked</p>
              <h2 className="view-title">The Kitchen</h2>
            </div>
            <div style={{
              border: "2px solid #b42318",
              padding: "28px 24px",
              maxWidth: 480,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b42318" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#b42318",
                }}>
                  Kitchen access requires Academy clearance
                </span>
              </div>
              <p style={{
                fontFamily: "var(--font-archivo), system-ui, sans-serif",
                fontSize: "0.9rem",
                color: "var(--yi-ink, #111)",
                margin: "0 0 20px",
                lineHeight: 1.5,
              }}>
                Complete all required Academy lessons to unlock The Kitchen. Recipes, voting, and governance become available once you earn your clearance.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("academy")}
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  padding: "11px 22px",
                  cursor: "pointer",
                }}
              >
                Return to Academy →
              </button>
            </div>
          </section>
        )}
        {activeTab === "academy" && (
          <AcademyView modules={modules} clearance={clearance} onModuleStart={handleModuleStart} />
        )}
        {activeTab === "vault" && <VaultView portfolio={seed.portfolio} />}
        {activeTab === "shop" && (
          <ShopView
            feature={seed.timesFeature}
            secondaryArticles={seed.timesSecondary}
            tickers={seed.marketTickers}
            news={seed.macroNews}
          />
        )}
        {activeTab === "lounge" && <LoungeView rankings={seed.rankings} />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
