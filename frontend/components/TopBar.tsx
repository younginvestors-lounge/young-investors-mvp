"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, Grid2x2, LogOut, Moon, Settings, Sun, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAppSettings } from "@/lib/appSettings";
import { tap } from "@/lib/haptics";
import { getProfileIcon } from "@/lib/profileIcons";
import { ExplainSheet, type ExplainContent } from "@/components/ExplainSheet";
import { GlossaryBook } from "@/components/GlossaryBook";
import { calculateConsensus } from "@/lib/domain";
import { getNotifications, markAllNotificationsRead, markNotificationRead, type AppNotification } from "@/lib/profileStore";
import type {
  AcademyClearance,
  AcademyModule,
  DashboardTab,
  ExecutionMode,
  TradeProposal,
} from "@/lib/types";

const TAB_LABELS: Record<DashboardTab, string> = {
  kitchen: "The Kitchen",
  academy: "The Academy",
  vault:   "The Vault",
  shop:    "The Shop",
  lounge:  "The Lounge",
};

/** Plain-language explainers so every dashboard figure is tappable, not arbitrary. */
const METRIC_INFO: Record<string, { title: string; lines: string[]; slang: string }> = {
  Academy: {
    title: "Academy progress",
    lines: [
      "How much of your learning you've finished.",
      "Hit 100% to sharpen your Kitchen receipts and your R1,001 practice capital story.",
    ],
    slang: "Finish class, unlock the bag. Easy.",
  },
  Consensus: {
    title: "Table consensus",
    lines: [
      "You haven't formed a Kitchen or voted yet — so there's no consensus to show. That's honest, not broken.",
      "Form a Kitchen, propose a recipe, and the table's agreement appears here. 60% to cook — the 60% Rule.",
    ],
    slang: "No Kitchen yet, no vote yet. Form one, then we count.",
  },
  Heat: {
    title: "Gordon's risk read",
    lines: [
      "No heat yet — you're not holding anything, so there's nothing for Gordon to rate.",
      "Once your Kitchen cooks a recipe and you hold a position, Gordon's risk score (0–100) shows up here.",
    ],
    slang: "No position, no heat. Cook something first.",
  },
  Vault: {
    title: "Vault performance",
    lines: [
      "Your practice Vault opens after Academy clearance.",
      "It starts as practice cash. Performance only appears after a Kitchen vote creates a mock holding.",
    ],
    slang: "Open the Vault first. No fake gains before a recipe cooks.",
  },
};

interface TopBarProps {
  activeTab: DashboardTab;
  executionMode: ExecutionMode;
  clearance: AcademyClearance;
  modules: AcademyModule[];
  proposals: TradeProposal[];
  chefName: string;
}

export function TopBar({
  activeTab,
  clearance,
  modules,
  proposals,
  chefName,
}: TopBarProps) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const ChefIcon = getProfileIcon(user?.profile_icon);
  const memberNumber = user?.member_number ?? null;
  const [explain, setExplain] = useState<ExplainContent | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    function poll() {
      getNotifications(20).then((ns) => setNotifications(ns)).catch(() => {});
    }
    poll();
    notifRef.current = setInterval(poll, 30_000);
    return () => { if (notifRef.current) clearInterval(notifRef.current); };
  }, [user]);

  function openMetric(label: string, value: string, color: string) {
    const info = METRIC_INFO[label];
    if (!info) return;
    setExplain({
      title: info.title,
      value,
      valueColor: color,
      lines: info.lines,
      slang: info.slang,
      footnote: "Tap any figure to learn what it means · Educational simulation · Not financial advice",
    });
  }

  const passedCount = modules.filter((m) => m.passed).length;
  const academyPct  = modules.length === 0 ? 0 : Math.round((passedCount / modules.length) * 100);

  const consensusReads = proposals.map((p) => calculateConsensus(p.votes));
  const avgConsensus   = consensusReads.length === 0 ? 0
    : Math.round(consensusReads.reduce((s, r) => s + r.yesPercent, 0) / consensusReads.length);

  const acColor   = clearance.complete ? "#167a3a" : "#b42318";
  const consColor = avgConsensus >= 60 ? "#167a3a" : "#b46918";

  // Honest dashboard: no fake numbers. Consensus/Heat stay empty until a Chef has a
  // real Kitchen and a real position. Vault is "Locked" until the Academy is cleared.
  const metrics = [
    { label: "Academy",   value: `${academyPct}%`, color: acColor },
    { label: "Consensus", value: "None",           color: "var(--yi-muted)" },
    { label: "Heat",      value: "—",              color: "var(--yi-muted)" },
    {
      label: "Vault",
      value: clearance.complete ? "Open" : "Locked",
      color: clearance.complete ? "#167a3a" : "var(--yi-muted)",
    },
  ];
  void avgConsensus; void consColor; // retained for when real data lands

  const { theme, toggleTheme, pattern, togglePattern, musicOn, musicAvailable, toggleMusic } = useAppSettings();

  const qt = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    border: active ? "1px solid var(--yi-black)" : "1px solid var(--yi-hairline)",
    background: active ? "var(--yi-black)" : "transparent",
    color: active ? "var(--yi-white)" : "var(--yi-muted)",
    cursor: "pointer",
  });

  async function handleLogout() {
    if (exiting) return;
    setExiting(true);
    await logout();
    router.push("/login");
  }

  return (
    <>
      {/* ── Top bar ── */}
      <header className="topbar-shell" style={{
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
      }}>
        {/* Left — wordmark (taps through to the Chef profile) */}
        <Link
          href="/profile"
          aria-label="Open your Chef profile"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0, textDecoration: "none", color: "inherit" }}
        >
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
                Chef No. {String(memberNumber).padStart(3, "0")}
              </span>
            )}
          </span>
        </Link>

        {/* Centre — current tab */}
        <span className="topbar-tab-label" style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--yi-ink)",
        }}>
          {TAB_LABELS[activeTab]}
        </span>

        {/* Right — quick toggles + settings + logout */}
        <span className="topbar-actions" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            onClick={() => { tap(); setGlossaryOpen(true); }}
            aria-label="Open Gordon's Glossary"
            title="Master Chef's Cookbook"
            style={qt(glossaryOpen)}
          >
            <BookOpen size={13} strokeWidth={1.8} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => { tap(); setNotifOpen(true); }}
            aria-label="Notifications"
            title="Notifications"
            style={{ ...qt(notifOpen), position: "relative" }}
          >
            <Bell size={13} strokeWidth={1.8} aria-hidden />
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 2,
                width: 7, height: 7,
                background: "#b42318",
                borderRadius: "50%",
                border: "1px solid var(--yi-nav-bg)",
                pointerEvents: "none",
              }} />
            )}
          </button>
          <button
            type="button"
            className="topbar-optional-toggle"
            onClick={() => { tap(); toggleMusic(); }}
            disabled={!musicAvailable}
            aria-pressed={musicOn}
            aria-label={musicOn ? "Pause music" : "Play music"}
            title={musicAvailable ? "Music" : "Add a track at public/audio/lounge.mp3"}
            style={qt(musicOn)}
          >
            {musicOn ? <Volume2 size={13} strokeWidth={1.8} aria-hidden /> : <VolumeX size={13} strokeWidth={1.8} aria-hidden />}
          </button>
          <button
            type="button"
            className="topbar-optional-toggle"
            onClick={() => { tap(); toggleTheme(); }}
            aria-pressed={theme === "dark"}
            aria-label="Night mode"
            title="Night mode"
            style={qt(theme === "dark")}
          >
            {theme === "dark" ? <Sun size={13} strokeWidth={1.8} aria-hidden /> : <Moon size={13} strokeWidth={1.8} aria-hidden />}
          </button>
          <button
            type="button"
            className="topbar-optional-toggle"
            onClick={() => { tap(); togglePattern(); }}
            aria-pressed={pattern}
            aria-label="Background pattern"
            title="Background pattern"
            style={qt(pattern)}
          >
            <Grid2x2 size={13} strokeWidth={1.8} aria-hidden />
          </button>
          <Link
            href="/profile"
            aria-label="Profile & settings"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, border: "1px solid var(--yi-hairline)", color: "var(--yi-muted)" }}
          >
            <Settings size={14} strokeWidth={1.7} aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => { tap(); setExitOpen(true); }}
            aria-label="Log out"
            title="Log out"
            style={qt(false)}
          >
            <LogOut size={13} strokeWidth={1.8} aria-hidden />
          </button>
        </span>
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
      }}>
        {metrics.map((m, i) => (
          <button
            key={m.label}
            type="button"
            onClick={() => openMetric(m.label, m.value, m.color)}
            aria-label={`What does ${m.label} ${m.value} mean?`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRight: i < metrics.length - 1 ? "1px solid var(--yi-hairline)" : "none",
              borderTop: "none",
              borderBottom: "none",
              borderLeft: "none",
              background: "transparent",
              cursor: "pointer",
              gap: 1,
              height: "100%",
            }}
          >
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: m.color,
              lineHeight: 1,
              borderBottom: "1px dotted var(--yi-muted)",
              paddingBottom: 1,
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
          </button>
        ))}
      </div>

      <ExplainSheet content={explain} onClose={() => setExplain(null)} />
      <GlossaryBook open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      {exitOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gordon exit note"
          onClick={(e) => { if (e.target === e.currentTarget && !exiting) setExitOpen(false); }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 360,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "var(--yi-paper)",
              color: "var(--yi-ink)",
              border: "1px solid var(--yi-frame)",
              borderBottom: "none",
              padding: "18px 20px max(20px, env(safe-area-inset-bottom, 20px))",
              display: "grid",
              gap: 14,
            }}
          >
            <div style={{ borderLeft: "2px solid #b42318", paddingLeft: 12 }}>
              <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#b42318", margin: "0 0 7px" }}>
                Gordon Note
              </p>
              <h2 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.35rem", fontWeight: 600, lineHeight: 1.1, margin: 0 }}>
                You are leaving the Kitchen?
              </h2>
              <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: "10px 0 0" }}>
                Say it properly, Chef. The table will keep your seat warm.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleLogout}
                disabled={exiting}
                style={{
                  minHeight: 44,
                  padding: "0 18px",
                  background: "var(--yi-black)",
                  color: "var(--yi-white)",
                  border: "none",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.62rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: exiting ? "default" : "pointer",
                  opacity: exiting ? 0.6 : 1,
                }}
              >
                {exiting ? "Stepping out..." : "I'll be right back"}
              </button>
              <button
                type="button"
                onClick={() => { tap(); setExitOpen(false); }}
                disabled={exiting}
                style={{
                  minHeight: 44,
                  padding: "0 18px",
                  background: "transparent",
                  color: "var(--yi-ink)",
                  border: "1px solid var(--yi-frame)",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.62rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: exiting ? "default" : "pointer",
                }}
              >
                Keep cooking
              </button>
            </div>

            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
              See you soon / Session only / Profile and progress stay intact
            </p>
          </div>
        </div>
      )}

      {notifOpen && (
        <NotificationCentre
          notifications={notifications}
          onClose={() => setNotifOpen(false)}
          onMarkRead={(id) => {
            markNotificationRead(id).catch(() => {});
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
          }}
          onMarkAllRead={() => {
            markAllNotificationsRead().catch(() => {});
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          }}
        />
      )}
    </>
  );
}

/* ── Notification centre ── */
function NotificationCentre({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 350,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(100vw, 360px)",
          height: "100svh",
          background: "var(--yi-white)",
          borderLeft: "1px solid var(--yi-frame)",
          display: "flex", flexDirection: "column",
          animation: "slide-right 220ms ease",
        }}
      >
        <style>{`@keyframes slide-right{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--yi-muted)", margin: 0 }}>
              Notification Centre
            </p>
            <h2 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.1rem", fontWeight: 600, margin: "4px 0 0", lineHeight: 1.1 }}>
              Updates
            </h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid var(--yi-frame)", padding: "6px 12px", fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", color: "var(--yi-ink)" }}>
            Close
          </button>
        </div>

        {/* Mark all */}
        {unreadCount > 0 && (
          <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
            <button type="button" onClick={onMarkAllRead} style={{ background: "transparent", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#167a3a", cursor: "pointer", padding: 0 }}>
              Mark all {unreadCount} as read
            </button>
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <div style={{ padding: "32px 18px", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)" }}>
                Nothing yet · the Kitchen is quiet
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => { if (!n.isRead) onMarkRead(n.id); }}
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--yi-hairline)",
                  background: n.isRead ? "transparent" : "var(--yi-soft)",
                  cursor: n.isRead ? "default" : "pointer",
                  display: "grid", gap: 4,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", fontWeight: n.isRead ? 400 : 600, color: "var(--yi-ink)", margin: 0, lineHeight: 1.3 }}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span style={{ width: 7, height: 7, background: "#b42318", borderRadius: "50%", flexShrink: 0, marginTop: 5 }} />
                  )}
                </div>
                {n.body && (
                  <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.78rem", color: "var(--yi-copy)", margin: 0, lineHeight: 1.5 }}>
                    {n.body}
                  </p>
                )}
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--yi-muted)", margin: 0 }}>
                  {relativeTime(n.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--yi-muted)", margin: 0 }}>
            Kitchen updates only · no marketing · mock demo
          </p>
        </div>
      </div>
    </div>
  );
}
