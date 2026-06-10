import clsx from "clsx";
import { ChefHat, GraduationCap, Lock, ShoppingBag, Sofa, Vault } from "lucide-react";
import { tap } from "@/lib/haptics";
import type { DashboardTab } from "@/lib/types";

interface NavItem {
  id: DashboardTab;
  label: string;
  Icon: typeof ChefHat;
}

const navItems: NavItem[] = [
  { id: "kitchen", label: "The Kitchen", Icon: ChefHat },
  { id: "academy", label: "The Academy", Icon: GraduationCap },
  { id: "vault", label: "The Vault", Icon: Vault },
  { id: "shop", label: "The Shop", Icon: ShoppingBag },
  { id: "lounge", label: "The Lounge", Icon: Sofa },
];

interface BottomNavProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  /** Tabs to mark as locked (gated until Academy clearance). */
  lockedTabs?: Partial<Record<DashboardTab, boolean>>;
}

export function BottomNav({ activeTab, onTabChange, lockedTabs = {} }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Young Investors core spaces">
      {navItems.map(({ id, label, Icon }) => {
        const locked = !!lockedTabs[id];
        return (
          <button
            key={id}
            type="button"
            className={clsx("bottom-nav-button", activeTab === id && "bottom-nav-button-active")}
            aria-current={activeTab === id ? "page" : undefined}
            aria-label={locked ? `${label} — locked until Academy is finished` : label}
            title={locked ? "Locked" : undefined}
            onClick={() => { tap(); onTabChange(id); }}
            style={locked ? { opacity: 0.6 } : undefined}
          >
            <span style={{ position: "relative", display: "inline-flex" }}>
              <Icon className="bottom-nav-icon" aria-hidden="true" />
              {locked && (
                <Lock
                  aria-hidden="true"
                  size={8}
                  strokeWidth={2.5}
                  style={{ position: "absolute", top: -2, right: -5, color: "var(--yi-muted)" }}
                />
              )}
            </span>
            <span className="bottom-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
