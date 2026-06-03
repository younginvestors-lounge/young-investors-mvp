"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getProfileIcon } from "@/lib/profileIcons";
import { calculateConsensus, formatPercent } from "@/lib/domain";
import type {
  AcademyClearance,
  AcademyModule,
  DashboardTab,
  ExecutionMode,
  PortfolioSnapshot,
  TradeProposal,
} from "@/lib/types";

const TAB_LABELS: Record<DashboardTab, string> = {
  kitchen: "The Kitchen",
  academy: "The Academy",
  vault:   "The Vault",
  shop:    "The Shop",
  lounge:  "The Lounge",
};

interface TopBarProps {
  activeTab: DashboardTab;
  executionMode: ExecutionMode;
  clearance: AcademyClearance;
  modules: AcademyModule[];
  portfolio: PortfolioSnapshot;
  proposals: TradeProposal[];
  chefName: string;
}

export function TopBar({
  activeTab,
  clearance,
  modules,
  portfolio,
  proposals,
  chefName,
}: TopBarProps) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const ChefIcon = getProfileIcon(user?.profile_icon);
  const memberNumber = user?.member_number ?? null;

  const passedCount = modules.filter((m) => m.passed).length;
  const academyPct  = modules.length === 0 ? 0 : Math.round((passedCount / modules.length) * 100);

  const consensusReads = proposals.map((p) => calculateConsensus(p.votes));
  const avgConsensus   = consensusReads.length === 0 ? 0
    : Math.round(consensusReads.reduce((s, r) => s + r.yesPercent, 0) / consensusReads.length);

  const riskScore = portfolio.gordonMarketRead.riskScore;
  const roi       = portfolio.roiPercent;

  const riskColor = riskScore >= 70 ? "#b42318" : riskScore >= 50 ? "#b46918" : "#167a3a";
  const roiColor  = roi > 0 ? "#167a3a" : roi < 0 ? "#b42318" : "#888";
  const acColor   = clearance.complete ? "#167a3a" : "#b42318";
  const consColor = avgConsensus >= 60 ? "#167a3a" : "#b46918";

  const metrics = [
    { label: "Academy",   value: `${academyPct}%`,   color: acColor   },
    { label: "Consensus", value: `${avgConsensus}%`,  color: consColor },
    { label: "Heat",      value: `${riskScore}`,      color: riskColor },
    { label: "Vault",     value: formatPercent(roi),  color: roiColor  },
  ];

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* ── Top bar ── */}
      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 30,
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: "1px solid var(--yi-hairline)",
        background: "var(--yi-nav-bg)",
        boxShadow: "0 2px 4px rgba(17, 17, 17, 0.06), 0 1px 1px rgba(17, 17, 17, 0.08)",
      }}>
        {/* Left — wordmark */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 26, height: 26, border: "1px solid var(--yi-hairline)", flexShrink: 0,
          }}>
            <ChefIcon size={15} strokeWidth={1.7} aria-hidden />
          </span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05, minWidth: 0 }}>
            <span style={{
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--yi-ink)",
              userSelect: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {chefName ? `Chef ${chefName}` : "Young Investors"}
            </span>
            {memberNumber != null && (
              <span style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--yi-muted)",
              }}>
                Chef No. {String(memberNumber).padStart(4, "0")}
              </span>
            )}
          </span>
        </span>

        {/* Centre — current tab */}
        <span style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--yi-ink)",
        }}>
          {TAB_LABELS[activeTab]}
        </span>

        {/* Right — logout only */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.52rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            border: "1px solid var(--yi-hairline)",
            background: "transparent",
            color: "var(--yi-muted)",
            padding: "0 10px",
            height: 28,
            cursor: "pointer",
          }}
        >
          Exit
        </button>
      </header>

      {/* ── Metrics strip ── */}
      <div style={{
        position: "fixed",
        top: 52, left: 0, right: 0,
        zIndex: 29,
        height: 36,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        borderBottom: "1px solid var(--yi-hairline)",
        background: "var(--yi-nav-bg)",
        boxShadow: "0 1px 2px rgba(17, 17, 17, 0.04)",
      }}>
        {metrics.map((m, i) => (
          <div key={m.label} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRight: i < metrics.length - 1 ? "1px solid var(--yi-hairline)" : "none",
            gap: 1,
          }}>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: m.color,
              lineHeight: 1,
            }}>
              {m.value}
            </span>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.46rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--yi-muted)",
              lineHeight: 1,
            }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
