"use client";

import { useRouter } from "next/navigation";
import type { DashboardTab, ExecutionMode } from "@/lib/types";

interface BrutalistHeaderProps {
  activeTab: DashboardTab;
  executionMode: ExecutionMode;
}

const viewNames: Record<DashboardTab, string> = {
  kitchen: "The Kitchen",
  academy: "The Academy",
  vault:   "The Vault",
  shop:    "The Shop",
  lounge:  "The Lounge",
};

export function BrutalistHeader({ activeTab, executionMode }: BrutalistHeaderProps) {
  const router = useRouter();

  function handleLogout() {
    try {
      localStorage.removeItem("yi_chef_name");
      localStorage.removeItem("yi_chef_age");
      localStorage.removeItem("yi_chef_intent");
    } catch {}
    router.push("/");
  }

  return (
    <header className="brutalist-header">
      <div className="header-row">
        <div className="brand-lockup">
          <p className="eyebrow">{executionMode}</p>
          <h1 className="title">young investors</h1>
          <p className="brand-motto">We Cook</p>
        </div>
        <div className="header-actions">
          <button type="button" className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <p className="badge">{viewNames[activeTab]}</p>
        </div>
      </div>
    </header>
  );
}
