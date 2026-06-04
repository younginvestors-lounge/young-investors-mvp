/**
 * Tiny haptics helper — the "alive" feel.
 *
 * Uses the Web Vibration API where supported (Android / Chrome mobile). It is a
 * no-op on iOS Safari and desktop, so it's always safe to call. Respects a saved
 * "haptics off" preference. Keep buzzes short and meaningful — feedback, not noise.
 */

function enabled(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  if (typeof navigator.vibrate !== "function") return false;
  try {
    return localStorage.getItem("yi_haptics") !== "off";
  } catch {
    return true;
  }
}

function buzz(pattern: number | number[]) {
  if (!enabled()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* no-op */
  }
}

/** A light tick — taps, toggles, nav. */
export const tap = () => buzz(8);
/** A slightly firmer press — primary actions, "continue". */
export const press = () => buzz(16);
/** A happy double-buzz — passed a lesson, you cooked. */
export const success = () => buzz([14, 40, 22]);
/** A soft warning — locked, blocked, wrong answer. */
export const warn = () => buzz([10, 30, 10]);

export function setHaptics(on: boolean) {
  try {
    localStorage.setItem("yi_haptics", on ? "on" : "off");
  } catch {
    /* ignore */
  }
}

export function hapticsOn(): boolean {
  return enabled();
}
