"use client";

import clsx from "clsx";
import { Moon, Sparkles, Square, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import type { BackgroundMode, DashboardTab, ExecutionMode, ThemeMode } from "@/lib/types";

interface BrutalistHeaderProps {
  activeTab: DashboardTab;
  executionMode: ExecutionMode;
  backgroundMode: BackgroundMode;
  onBackgroundModeChange: (mode: BackgroundMode) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const viewNames: Record<DashboardTab, string> = {
  kitchen: "The Kitchen",
  academy: "The Academy",
  vault: "The Vault",
  shop: "The Shop",
  lounge: "The Lounge",
};

export function BrutalistHeader({
  activeTab,
  executionMode,
  backgroundMode,
  onBackgroundModeChange,
  theme,
  onThemeChange,
}: BrutalistHeaderProps) {
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
          <p className="eyebrow">Lifestyle finance / {executionMode}</p>
          <h1 className="title">young investors</h1>
          <p className="brand-motto">We Cook</p>
          <p className="subtitle">
            Build identity with your Kitchen, learn before you earn, and turn calm financial
            discipline into recipes the whole table can approve.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <p className="badge">{viewNames[activeTab]}</p>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              type="button"
              className="theme-toggle"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="icon-inline" aria-hidden="true" />
              ) : (
                <Moon className="icon-inline" aria-hidden="true" />
              )}
            </button>
            <div className="background-toggle" aria-label="Background mode">
              <button
                type="button"
                className={clsx(
                  "background-toggle-button",
                  backgroundMode === "solid" && "background-toggle-button-active",
                )}
                aria-pressed={backgroundMode === "solid"}
                onClick={() => onBackgroundModeChange("solid")}
              >
                <Square className="icon-inline" aria-hidden="true" />
                <span>Solid</span>
              </button>
              <button
                type="button"
                className={clsx(
                  "background-toggle-button",
                  backgroundMode === "pattern" && "background-toggle-button-active",
                )}
                aria-pressed={backgroundMode === "pattern"}
                onClick={() => onBackgroundModeChange("pattern")}
              >
                <Sparkles className="icon-inline" aria-hidden="true" />
                <span>Pattern</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
