"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
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
import { profileIsOnboarded } from "@/lib/profileStore";
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

function GordonNextActionCard({
  activeTab,
  clearance,
  modules,
  onTabChange,
}: {
  activeTab: DashboardTab;
  clearance: AcademyClearance;
  modules: AcademyModule[];
  onTabChange: (tab: DashboardTab) => void;
}) {
  const nextOpenLesson = modules.find((module) => !module.passed && !module.locked);
  const missingCount = clearance.missingModuleIds.length;
  const copyByTab: Record<DashboardTab, { line: string; target?: DashboardTab; cta?: string }> = {
    academy: {
      line: nextOpenLesson
        ? `Next plate: clear ${nextOpenLesson.title}. High scores build trust before the Kitchen votes.`
        : "Next plate: submit a practice attempt and sharpen your Chef Scorecard.",
    },
    kitchen: clearance.complete
      ? { line: "Next plate: season one reason clearly, then check whether the table can reach 60%." }
      : { line: `${missingCount} Academy lesson${missingCount === 1 ? "" : "s"} still stand between you and the Kitchen.`, target: "academy", cta: "Go Academy" },
    vault: {
      line: "Next plate: long-press a Shop stock, create a Shelf receipt, then follow it back here.",
      target: "shop",
      cta: "Open Shop",
    },
    shop: {
      line: "Next plate: tap a Top 40 stock for Gordon's heat check, then long-press to choose buy, sell, or hold.",
    },
    lounge: {
      line: "Next plate: tap a rank term, read the meaning, then open Gordon's Cookbook if the word is still fuzzy.",
    },
  };
  const next = copyByTab[activeTab];

  return (
    <div style={{ border: "1px solid var(--yi-frame)", borderLeft: "2px solid var(--yi-black)", background: "var(--yi-card-bg)", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <p style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.45, color: "var(--yi-copy)", margin: 0, minWidth: 0 }}>
        <Compass size={15} strokeWidth={1.8} aria-hidden style={{ color: "var(--yi-ink)", flexShrink: 0 }} />
        <span><strong style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-ink)", marginRight: 6 }}>Gordon / Next</strong>{next.line}</span>
      </p>
      {next.target && next.cta && (
        <button
          type="button"
          onClick={() => { if (next.target) onTabChange(next.target); }}
          style={{ minHeight: 34, border: "none", background: "var(--yi-black)", color: "var(--yi-white)", padding: "0 12px", fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
        >
          {next.cta}
        </button>
      )}
    </div>
  );
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

  // Guard the app shell: Auth creates the account; onboarding clears the profile.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isLoading && isAuthenticated && !profileIsOnboarded(user)) {
      router.replace("/onboarding");
    }
  }, [isLoading, isAuthenticated, user, router]);

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
  if (isLoading || !isAuthenticated || !profileIsOnboarded(user)) {
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
        proposals={proposals}
        chefName={chefName}
      />

      <main className="dashboard-main">
        <GordonNextActionCard
          activeTab={activeTab}
          clearance={clearance}
          modules={modules}
          onTabChange={setActiveTab}
        />

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
