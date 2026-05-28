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

interface AppShellProps {
  initialTab?: DashboardTab;
}

export default function AppShell({ initialTab = "academy" }: AppShellProps) {
  const seed = getDashboardSnapshot();

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("solid");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [proposals, setProposals] = useState<TradeProposal[]>(seed.tradeProposals);
  const [modules, setModules] = useState<AcademyModule[]>(seed.academyModules);
  const [clearance, setClearance] = useState<AcademyClearance>(seed.academyClearance);

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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("yi_theme", theme); } catch {}
  }, [theme]);

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

        {activeTab === "kitchen" && <KitchenView />}
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
