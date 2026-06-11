"use client";

/**
 * FocusNag — the concentration call.
 *
 * If a chef skipped the Academy onboarding (the Gordon/Sicilia briefing), this
 * strip appears on every page until they finish it. Deliberately persistent and
 * impossible to dismiss: wealth creation requires focus, and the product
 * incentivises concentration instead of farming dopamine. Completing the
 * briefing — building the chef image in their own mind — is the only way to
 * clear it.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { briefingSeen } from "@/lib/briefing";
import { tap } from "@/lib/haptics";

const LINES = [
  "Wealth creation requires focus. Finish onboarding?",
  "The Academy begins after the briefing. Meet Gordon.",
  "A chef finishes what they start. Complete your briefing.",
  "Focus is the first asset in your Vault. Finish onboarding.",
  "Concentration is the craft. Your briefing is still open.",
];

export function FocusNag({ style }: { style?: React.CSSProperties }) {
  const router = useRouter();
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!user) { setShow(false); return; }
    setShow(!briefingSeen(user.id));
  }, [user]);

  // Rotate the line so the call stays alive, not wallpaper.
  useEffect(() => {
    if (!show) return;
    const t = setInterval(() => setIdx((i) => i + 1), 12_000);
    return () => clearInterval(t);
  }, [show]);

  if (!show) return null;
  const line = LINES[idx % LINES.length];

  return (
    <button
      type="button"
      onClick={() => { tap(); router.push("/gordon-intro"); }}
      aria-label="Complete Academy onboarding"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: "var(--yi-black)",
        color: "var(--yi-white)",
        border: "none",
        padding: "11px 14px",
        cursor: "pointer",
        textAlign: "left",
        ...style,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <Flame size={14} strokeWidth={1.8} aria-hidden style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.84rem", lineHeight: 1.45 }}>
          <strong style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 8 }}>
            Gordon · Focus
          </strong>
          {line}
        </span>
      </span>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "underline", textUnderlineOffset: 3, flexShrink: 0 }}>
        Finish →
      </span>
    </button>
  );
}
