import clsx from "clsx";
import { ChefHat, GraduationCap, ShoppingBag, Sofa, Vault } from "lucide-react";
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
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Young Investors core spaces">
      {navItems.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={clsx("bottom-nav-button", activeTab === id && "bottom-nav-button-active")}
          aria-current={activeTab === id ? "page" : undefined}
          onClick={() => onTabChange(id)}
        >
          <Icon className="bottom-nav-icon" aria-hidden="true" />
          <span className="bottom-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
