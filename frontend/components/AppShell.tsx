"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AcademyComplete } from "@/components/AcademyComplete";
import { AcademyView } from "@/components/AcademyView";
import { BottomNav } from "@/components/BottomNav";
import { KitchenView } from "@/components/KitchenView";
import { LoungeView } from "@/components/LoungeView";
import { Reveal } from "@/components/Reveal";
import { ShopView } from "@/components/ShopView";
import { TopBar } from "@/components/TopBar";
import { VaultLocked, VaultStart } from "@/components/VaultGate";
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

const ACADEMY_PROGRESS_KEY = "yi_academy_progress";
const ACADEMY_ACK_KEY = "yi_academy_ack";

function perChefKey(prefix: string, chefId?: string): string {
  return chefId ? `${prefix}:${chefId}` : prefix;
}

function deriveAcademyState(
  seedModules: AcademyModule[],
  seedClearance: AcademyClearance,
  passedModuleIds: string[]
): { modules: AcademyModule[]; clearance: AcademyClearance } {
  const passed = new Set([...seedModules.filter((module) => module.passed).map((module) => module.id), ...passedModuleIds]);
  let foundFirstIncomplete = false;

  const modules = seedModules.map((module) => {
    const isPassed = passed.has(module.id);
    const locked = isPassed ? false : foundFirstIncomplete;
    if (!isPassed) foundFirstIncomplete = true;
    return { ...module, passed: isPassed, locked };
  });

  const requiredModuleIds = seedClearance.requiredModuleIds;
  const missingModuleIds = requiredModuleIds.filter((id) => !passed.has(id));

  return {
    modules,
    clearance: {
      ...seedClearance,
      passedModuleIds: modules.filter((module) => module.passed).map((module) => module.id),
      missingModuleIds,
      complete: missingModuleIds.length === 0,
    },
  };
}

function readPassedModules(chefId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(perChefKey(ACADEMY_PROGRESS_KEY, chefId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writePassedModules(chefId: string | undefined, moduleIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(perChefKey(ACADEMY_PROGRESS_KEY, chefId), JSON.stringify(Array.from(new Set(moduleIds))));
  } catch {
    /* local demo persistence is best-effort */
  }
}

export default function AppShell({ initialTab = "kitchen" }: AppShellProps) {
  const seed = getDashboardSnapshot();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [proposals, setProposals] = useState<TradeProposal[]>(seed.tradeProposals);
  const [modules, setModules] = useState<AcademyModule[]>(seed.academyModules);
  const [clearance, setClearance] = useState<AcademyClearance>(seed.academyClearance);
  const [academyLessonOpen, setAcademyLessonOpen] = useState(false);

  const chefName = user?.chef_alias ?? "";
  const chefId = user?.id;

  // The Academy-complete celebration shows once per device (then Sicilia → Lounge).
  const [acked, setAcked] = useState(true);
  useEffect(() => {
    try { setAcked(localStorage.getItem(perChefKey(ACADEMY_ACK_KEY, chefId)) === "1"); } catch { setAcked(true); }
  }, [chefId]);
  function markAck() {
    setAcked(true);
    try { localStorage.setItem(perChefKey(ACADEMY_ACK_KEY, chefId), "1"); } catch {}
  }

  useEffect(() => {
    const next = deriveAcademyState(seed.academyModules, seed.academyClearance, readPassedModules(chefId));
    setModules(next.modules);
    setClearance(next.clearance);
  }, [chefId, seed.academyModules, seed.academyClearance]);

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
    const nextPassed = Array.from(new Set([...modules.filter((m) => m.passed).map((m) => m.id), moduleId]));
    writePassedModules(chefId, nextPassed);
    const next = deriveAcademyState(seed.academyModules, seed.academyClearance, nextPassed);
    setModules(next.modules);
    setClearance(next.clearance);
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
        <Reveal key={activeTab}>
          {activeTab === "kitchen" && <KitchenView clearance={clearance} />}
          {activeTab === "academy" && (
            <AcademyView
              modules={modules}
              clearance={clearance}
              onModuleStart={handleModuleStart}
              onLessonOpenChange={setAcademyLessonOpen}
            />
          )}
          {activeTab === "vault" && (
            clearance.complete
              ? <VaultStart chefName={chefName || "Chef"} />
              : <VaultLocked passedCount={modules.filter((m) => m.passed).length} totalCount={modules.length} />
          )}
          {activeTab === "shop" && (
            <ShopView
              feature={seed.timesFeature}
              secondaryArticles={seed.timesSecondary}
              tickers={seed.marketTickers}
              news={seed.macroNews}
            />
          )}
          {activeTab === "lounge" && <LoungeView rankings={seed.rankings} />}
        </Reveal>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} lockedTabs={{ vault: !clearance.complete }} />

      {clearance.complete && !acked && !academyLessonOpen && (
        <AcademyComplete
          chefName={chefName || "Chef"}
          score={user?.academy_score ?? 0}
          lessonsPassed={modules.filter((m) => m.passed).length}
          onEnterLounge={() => { setActiveTab("lounge"); markAck(); }}
          onClose={markAck}
        />
      )}
    </div>
  );
}
