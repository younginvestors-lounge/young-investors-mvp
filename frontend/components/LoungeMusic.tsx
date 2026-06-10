"use client";

/**
 * Lounge music button — a thin control over the GLOBAL player in lib/appSettings.
 * The actual <audio> + now-playing toast live in the AppSettingsProvider so music
 * plays across every page and the toolbar toggle stays in sync.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — ambience only.
 */

import { Music, Volume2, VolumeX } from "lucide-react";
import { useAppSettings } from "@/lib/appSettings";
import { tap } from "@/lib/haptics";

export function LoungeMusic() {
  const { musicOn, musicAvailable, toggleMusic } = useAppSettings();

  const label = !musicAvailable ? "Music soon" : musicOn ? "Music on" : "Music";
  const title = !musicAvailable
    ? "Add a track at public/audio/lounge.mp3"
    : musicOn
      ? "Pause lounge music"
      : "Play lounge music";

  return (
    <button
      type="button"
      onClick={() => { tap(); toggleMusic(); }}
      disabled={!musicAvailable}
      aria-label={title}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 11px",
        minHeight: 36,
        border: "1px solid var(--yi-frame)",
        background: musicOn ? "var(--yi-black)" : "transparent",
        color: musicOn ? "var(--yi-white)" : musicAvailable ? "var(--yi-ink)" : "var(--yi-muted)",
        fontFamily: "var(--font-mono), monospace",
        fontSize: "0.56rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        cursor: musicAvailable ? "pointer" : "not-allowed",
        opacity: musicAvailable ? 1 : 0.6,
      }}
    >
      {!musicAvailable ? (
        <Music size={13} strokeWidth={1.8} aria-hidden />
      ) : musicOn ? (
        <Volume2 size={13} strokeWidth={1.8} aria-hidden />
      ) : (
        <VolumeX size={13} strokeWidth={1.8} aria-hidden />
      )}
      {label}
    </button>
  );
}
