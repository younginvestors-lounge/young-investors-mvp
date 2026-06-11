"use client";

/**
 * /lobby — the entrance hall of the Young Investors house.
 *
 * Follows the YI star architecture: the Chef stands at the centre; Gordon's
 * upward triangle (solid, teal) holds Academy, Kitchen and Vault — craft, the
 * how; Sicilia's downward triangle (dashed, coral) holds Times, Lounge and
 * The Table — meaning, the why. Every room wires back to the chef.
 *
 * This is the page a chef lands on after signing in, returns to between rooms,
 * and steps out from when leaving. MOCK_MVP_PAPER_TRADING_ONLY.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  GraduationCap,
  LogOut,
  MessagesSquare,
  Newspaper,
  Settings,
  Sofa,
  Vault as VaultIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { tap } from "@/lib/haptics";
import { getProfileIcon } from "@/lib/profileIcons";
import { profileIsOnboarded } from "@/lib/profileStore";

// The two parents of the house — the only place these accents appear.
const GORDON_TEAL = "#1D9E75";
const SICILIA_CORAL = "#D85A30";

interface Room {
  name: string;
  tagline: string;
  line: string;
  href: string;
  Icon: typeof ChefHat;
  /** The Table opens Kitchen chat directly. */
  openChat?: boolean;
}

const GORDON_ROOMS: Room[] = [
  { name: "Academy", tagline: "Follow the money", line: "Learn the craft. Clear the classes.", href: "/academy", Icon: GraduationCap },
  { name: "Kitchen", tagline: "Propose · vote", line: "The 60% Rule runs the table.", href: "/kitchen", Icon: ChefHat },
  { name: "Vault", tagline: "What you own", line: "Practice capital, plates, and heat.", href: "/vault", Icon: VaultIcon },
];

const SICILIA_ROOMS: Room[] = [
  { name: "Times", tagline: "Story · culture", line: "The Shop and the Young Investor Times.", href: "/shop", Icon: Newspaper },
  { name: "Lounge", tagline: "Status · ranks", line: "Earn your seat. Beat Gordon.", href: "/lounge", Icon: Sofa },
  { name: "The Table", tagline: "Chat · community", line: "Your chefs, your talk, your code.", href: "/kitchen", Icon: MessagesSquare, openChat: true },
];

const mono = (rem: number, color: string): React.CSSProperties => ({
  fontFamily: "var(--font-mono), monospace",
  fontSize: `${rem}rem`,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color,
});

function RoomCard({ room, onEnter }: { room: Room; onEnter: (room: Room) => void }) {
  const { Icon } = room;
  return (
    <button
      type="button"
      onClick={() => onEnter(room)}
      aria-label={`Enter ${room.name}`}
      style={{
        display: "grid",
        gap: 8,
        textAlign: "left",
        border: "1px solid var(--yi-frame)",
        background: "var(--yi-card-bg)",
        color: "var(--yi-ink)",
        padding: "16px 16px 14px",
        cursor: "pointer",
        minHeight: 124,
        alignContent: "start",
      }}
    >
      <Icon size={20} strokeWidth={1.6} aria-hidden />
      <span style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.18rem", fontWeight: 600, lineHeight: 1.1 }}>
        {room.name}
      </span>
      <span style={mono(0.52, "var(--yi-muted)")}>{room.tagline}</span>
      <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.8rem", lineHeight: 1.45, color: "var(--yi-copy)" }}>
        {room.line}
      </span>
    </button>
  );
}

export default function LobbyPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [confirmExit, setConfirmExit] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (!profileIsOnboarded(user)) router.replace("/onboarding");
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || !profileIsOnboarded(user)) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--yi-paper)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={mono(0.6, "var(--yi-muted)")}>Young Investors</span>
      </div>
    );
  }

  const ChefIcon = getProfileIcon(user?.profile_icon);
  const alias = (user?.chef_alias ?? "").trim().replace(/^chef\s+/i, "") || "Young Investor";
  const chefNumber = user?.member_number != null ? String(user.member_number).padStart(3, "0") : null;

  function enterRoom(room: Room) {
    tap();
    if (room.openChat) {
      try { sessionStorage.setItem("yi_open_chat", "1"); } catch {}
    }
    router.push(room.href);
  }

  function requestExit() {
    tap();
    setConfirmExit(true);
    setTimeout(() => setConfirmExit(false), 4000);
  }

  async function handleExit() {
    if (exiting) return;
    setExiting(true);
    await logout();
    router.push("/login");
  }

  return (
    <main style={{ minHeight: "100svh", background: "var(--yi-paper)", color: "var(--yi-ink)", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes lobby-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .lobby-body { animation: lobby-in 480ms cubic-bezier(.16,.84,.44,1) both; }
        @media (prefers-reduced-motion: reduce) { .lobby-body { animation: none; } }
      `}</style>

      <div style={{ height: 2, background: "var(--yi-ink)", flexShrink: 0 }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 20px 0" }}>
        <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Young Investors
        </span>
        <span style={mono(0.56, "var(--yi-muted)")}>The House · Lobby</span>
      </div>

      <div className="lobby-body" style={{ width: "100%", maxWidth: 640, margin: "0 auto", padding: "clamp(20px,5vw,36px) 20px 40px", display: "grid", gap: 22 }}>

        {/* Hero — the house and the chef at its centre */}
        <div>
          <p style={{ ...mono(0.58, "var(--yi-muted)"), margin: "0 0 8px" }}>Two parents · one home</p>
          <h1 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(2.1rem,9vw,3rem)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.02em", margin: 0 }}>
            The Lobby
          </h1>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", lineHeight: 1.55, color: "var(--yi-copy)", margin: "10px 0 0", maxWidth: 400 }}>
            Six rooms. Every one of them wires back to you, Chef {alias}.
          </p>
        </div>

        {/* The Chef — centre of the star */}
        <Link
          href="/profile"
          aria-label="Open your Chef profile"
          style={{ display: "flex", alignItems: "center", gap: 14, border: "1px solid var(--yi-ink)", background: "var(--yi-card-bg)", padding: "14px 16px", textDecoration: "none", color: "inherit" }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, border: "1px solid var(--yi-frame)", flexShrink: 0 }}>
            <ChefIcon size={24} strokeWidth={1.5} aria-hidden />
          </span>
          <span style={{ display: "grid", gap: 3, minWidth: 0, flex: 1 }}>
            <span style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.15rem", fontWeight: 600, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Chef {alias}
            </span>
            <span style={mono(0.5, "var(--yi-muted)")}>
              {chefNumber ? `Chef No. ${chefNumber} · ` : ""}{user?.rank ?? "Commis"} · The centre of the house
            </span>
          </span>
          <Settings size={16} strokeWidth={1.7} aria-hidden style={{ color: "var(--yi-muted)", flexShrink: 0 }} />
        </Link>

        {/* Gordon's triangle — craft, the how */}
        <div>
          <p style={{ ...mono(0.54, "var(--yi-muted)"), display: "flex", alignItems: "center", gap: 8, margin: "0 0 10px" }}>
            <span aria-hidden style={{ display: "inline-block", width: 20, borderTop: `2px solid ${GORDON_TEAL}` }} />
            Gordon · craft · the how
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: 10 }}>
            {GORDON_ROOMS.map((room) => <RoomCard key={room.name} room={room} onEnter={enterRoom} />)}
          </div>
        </div>

        {/* Sicilia's triangle — meaning, the why */}
        <div>
          <p style={{ ...mono(0.54, "var(--yi-muted)"), display: "flex", alignItems: "center", gap: 8, margin: "0 0 10px" }}>
            <span aria-hidden style={{ display: "inline-block", width: 20, borderTop: `2px dashed ${SICILIA_CORAL}` }} />
            Sicilia · meaning · the why
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: 10 }}>
            {SICILIA_ROOMS.map((room) => <RoomCard key={room.name} room={room} onEnter={enterRoom} />)}
          </div>
        </div>

        {/* The bonds — where the marriage runs the house */}
        <p style={{ ...mono(0.5, "var(--yi-muted)"), lineHeight: 1.8, margin: 0 }}>
          Where the triangles cross: Seasoning · The Guide · Ranks · Beat Gordon · The Creed · The 60% Rule
        </p>

        {/* Step out — the lobby is the last room before the door */}
        <div style={{ borderTop: "1px solid var(--yi-hairline)", paddingTop: 18 }}>
          {confirmExit ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleExit}
                disabled={exiting}
                style={{ ...mono(0.58, "var(--yi-white)"), display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 18px", background: "var(--yi-black)", border: "none", cursor: exiting ? "default" : "pointer", opacity: exiting ? 0.6 : 1 }}
              >
                <LogOut size={14} strokeWidth={1.8} aria-hidden />
                {exiting ? "Stepping out…" : "Yes, step out"}
              </button>
              <span style={mono(0.5, "var(--yi-muted)")}>The table keeps your seat warm</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={requestExit}
              style={{ ...mono(0.56, "var(--yi-muted)"), display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid var(--yi-hairline)", minHeight: 42, padding: "0 16px", cursor: "pointer" }}
            >
              <LogOut size={13} strokeWidth={1.8} aria-hidden />
              Step out of the house
            </button>
          )}
        </div>

        <p style={{ ...mono(0.48, "var(--yi-muted)"), margin: 0, lineHeight: 1.7 }}>
          MOCK_MVP_PAPER_TRADING_ONLY · Educational simulation · No real money · Not financial advice
        </p>
      </div>
    </main>
  );
}
