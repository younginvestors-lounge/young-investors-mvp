/**
 * Academy onboarding (the Gordon/Sicilia briefing) seen-state.
 *
 * The briefing is skippable — focus is incentivised, never forced. Until a
 * chef completes it, the FocusNag calls them back on every page. Stored
 * per-chef, with the legacy global key honoured for accounts that finished
 * the briefing before per-chef tracking existed.
 */

const KEY = "yi_briefing_seen";

export function briefingSeen(chefId?: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (chefId && localStorage.getItem(`${KEY}:${chefId}`) === "1") return true;
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markBriefingSeen(chefId?: string): void {
  try {
    localStorage.setItem(KEY, "1");
    if (chefId) localStorage.setItem(`${KEY}:${chefId}`, "1");
  } catch {
    /* best-effort device persistence */
  }
}
