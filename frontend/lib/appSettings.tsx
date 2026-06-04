"use client";

/**
 * Global app settings — one source of truth for night mode, background pattern, and
 * music, so the toolbar quick-toggles AND the Settings page stay in sync, and music
 * plays on EVERY page (the audio element lives here, at the root).
 *
 * Persisted in localStorage; theme is also applied pre-paint by the inline script in
 * layout.tsx to avoid a flash. MOCK_MVP_PAPER_TRADING_ONLY — ambience + chrome only.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Music } from "lucide-react";

const MUSIC_SOURCES = ["/audio/lounge.mp3", "/audio/lounge.m4a", "/audio/lounge.ogg"];
const MUSIC_TRACK = "Tadow — FKJ & Masego";

type Theme = "light" | "dark";

interface AppSettingsValue {
  theme: Theme;
  toggleTheme: () => void;
  pattern: boolean;
  togglePattern: () => void;
  musicOn: boolean;
  musicAvailable: boolean;
  toggleMusic: () => void;
}

const Ctx = createContext<AppSettingsValue | null>(null);

function themeFromSystem(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [pattern, setPattern] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [musicAvailable, setMusicAvailable] = useState(true);
  const [toast, setToast] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync state with what's already on <html> (theme set pre-paint) + saved pattern.
  useEffect(() => {
    try {
      const t = document.documentElement.getAttribute("data-theme");
      if (t === "dark" || t === "light") setTheme(t);
      const p = localStorage.getItem("yi_pattern") === "on";
      setPattern(p);
      document.documentElement.setAttribute("data-pattern", p ? "on" : "off");
    } catch {
      /* ignore */
    }
  }, []);

  // First-time visitors follow their phone/system setting. Once they use the app
  // toggle, yi_theme is saved and that manual choice wins.
  useEffect(() => {
    let saved = false;
    try {
      const t = localStorage.getItem("yi_theme");
      saved = t === "dark" || t === "light";
    } catch {
      saved = true;
    }
    if (saved || !window.matchMedia) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const next = themeFromSystem();
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener?.(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener?.(update);
    };
  }, []);

  // Mirror the real audio element state (OS / other tab can pause it).
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setMusicOn(true);
    const onPause = () => setMusicOn(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("yi_theme", next);
      } catch {}
      return next;
    });
  }, []);

  const togglePattern = useCallback(() => {
    setPattern((prev) => {
      const next = !prev;
      try {
        document.documentElement.setAttribute("data-pattern", next ? "on" : "off");
        localStorage.setItem("yi_pattern", next ? "on" : "off");
      } catch {}
      return next;
    });
  }, []);

  const toggleMusic = useCallback(async () => {
    const a = audioRef.current;
    if (!a || !musicAvailable) return;
    if (!a.paused) {
      a.pause();
      try { localStorage.setItem("yi_music", "off"); } catch {}
      return;
    }
    try {
      a.volume = 0.4;
      a.loop = true;
      await a.play();
      try { localStorage.setItem("yi_music", "on"); } catch {}
      setToast(true);
      window.setTimeout(() => setToast(false), 4500);
    } catch {
      if (a.error || a.networkState === a.NETWORK_NO_SOURCE) setMusicAvailable(false);
    }
  }, [musicAvailable]);

  return (
    <Ctx.Provider value={{ theme, toggleTheme, pattern, togglePattern, musicOn, musicAvailable, toggleMusic }}>
      {children}

      {/* App-wide audio so music continues across pages */}
      <audio ref={audioRef} preload="metadata" onCanPlay={() => setMusicAvailable(true)} onError={() => setMusicAvailable(false)}>
        {MUSIC_SOURCES.map((s) => (
          <source key={s} src={s} />
        ))}
      </audio>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "calc(124px + env(safe-area-inset-bottom, 0px))",
            zIndex: 400,
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: "var(--yi-black)",
            color: "var(--yi-white)",
            border: "1px solid var(--yi-frame)",
            padding: "9px 14px",
            maxWidth: "90vw",
            animation: "nowplaying-in 260ms ease both",
          }}
        >
          <style>{`@keyframes nowplaying-in{from{opacity:0;transform:translate(-50%,14px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
          <Music size={13} strokeWidth={1.9} aria-hidden />
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.7 }}>Now playing</span>
          <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{MUSIC_TRACK}</span>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useAppSettings(): AppSettingsValue {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAppSettings must be used within <AppSettingsProvider>.");
  return c;
}
