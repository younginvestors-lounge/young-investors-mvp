"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AcademyView } from "@/components/AcademyView";
import { BottomNav } from "@/components/BottomNav";
import { KitchenView } from "@/components/KitchenView";
import { LoungeView } from "@/components/LoungeView";
import { ShopView } from "@/components/ShopView";
import { TopBar } from "@/components/TopBar";
import { VaultView } from "@/components/VaultView";
import { getDashboardSnapshot } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  EXECUTION_MODE,
  type AcademyClearance,
  type AcademyModule,
  type DashboardTab,
  type TradeProposal,
} from "@/lib/types";

interface AppShellProps {
  initialTab?: DashboardTab;
}

export default function AppShell({ initialTab = "kitchen" }: AppShellProps) {
  const seed = getDashboardSnapshot();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [proposals, setProposals] = useState<TradeProposal[]>(seed.tradeProposals);
  const [modules, setModules] = useState<AcademyModule[]>(seed.academyModules);
  const [clearance, setClearance] = useState<AcademyClearance>(seed.academyClearance);

  const chefName = user?.chef_alias ?? "";

  // Guard the app shell: an unauthenticated visitor is sent to sign in.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

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

  // While auth resolves (or while redirecting an unauthenticated visitor),
  // hold a calm white screen instead of flashing the dashboard.
  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: "100svh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "#bbb" }}>
          Young Investors
        </span>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <TopBar
        activeTab={activeTab}
        executionMode={EXECUTION_MODE}
        clearance={clearance}
        modules={modules}
        portfolio={seed.portfolio}
        proposals={proposals}
        chefName={chefName}
      />

      <main className="dashboard-main">
        {activeTab === "kitchen" && <KitchenView clearance={clearance} />}
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
