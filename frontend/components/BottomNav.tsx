"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { ChefHat, GraduationCap, Home, Lock, ShoppingBag, Sofa, Vault } from "lucide-react";
import { tap } from "@/lib/haptics";
import type { DashboardTab } from "@/lib/types";

interface NavItem {
  id: DashboardTab;
  label: string;
  Icon: typeof ChefHat;
}

const navItems: NavItem[] = [
  { id: "kitchen", label: "Kitchen", Icon: ChefHat },
  { id: "academy", label: "Academy", Icon: GraduationCap },
  { id: "vault", label: "Vault", Icon: Vault },
  { id: "shop", label: "Shop", Icon: ShoppingBag },
  { id: "lounge", label: "Lounge", Icon: Sofa },
];

interface BottomNavProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  lockedTabs?: Partial<Record<DashboardTab, boolean>>;
}

export function BottomNav({ activeTab, onTabChange, lockedTabs = {} }: BottomNavProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function expand() {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    setExpanded(true);
  }

  function collapse() {
    setExpanded(false);
  }

  function touchExpand() {
    if (!expanded) {
      expand();
      collapseTimer.current = setTimeout(() => setExpanded(false), 1800);
    }
  }

  return (
    <nav
      className={clsx("bottom-nav-island", expanded && "bottom-nav-island--expanded")}
      aria-label="Young Investors core spaces"
      onMouseEnter={expand}
      onMouseLeave={collapse}
      onTouchStart={touchExpand}
    >
      <button
        type="button"
        className="bottom-nav-island-btn"
        aria-label="Back to the Lobby"
        onClick={() => { tap(); router.push("/lobby"); }}
      >
        <span style={{ position: "relative", display: "inline-flex" }}>
          <Home size={20} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="bottom-nav-island-label">Lobby</span>
      </button>
      <span aria-hidden style={{ width: 1, alignSelf: "stretch", margin: "6px 3px", background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
      {navItems.map(({ id, label, Icon }) => {
        const locked = !!lockedTabs[id];
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            className={clsx("bottom-nav-island-btn", active && "bottom-nav-island-btn--active")}
            aria-current={active ? "page" : undefined}
            aria-label={locked ? `${label} — locked until Academy is finished` : label}
            title={locked ? "Locked" : undefined}
            onClick={() => { tap(); onTabChange(id); }}
            style={locked ? { opacity: 0.45 } : undefined}
          >
            <span style={{ position: "relative", display: "inline-flex" }}>
              <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              {locked && (
                <Lock
                  aria-hidden="true"
                  size={8}
                  strokeWidth={2.5}
                  style={{ position: "absolute", top: -2, right: -5 }}
                />
              )}
            </span>
            <span className="bottom-nav-island-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
