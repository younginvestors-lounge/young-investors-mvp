"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Share2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppSettings } from "@/lib/appSettings";
import { getProfileIcon, PROFILE_ICONS } from "@/lib/profileIcons";
import { FIRST_TESTER_NUMBER, RESERVED_CHEFS } from "@/lib/profileStore";
import { FocusNag } from "@/components/FocusNag";
import { GordonGuideSheet } from "@/components/GordonGuideSheet";

const CREDENTIAL_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  cleared: "Cleared",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isLocalMode, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [alias, setAlias] = useState("");
  const [icon, setIcon] = useState("chef-default");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const { theme, toggleTheme, pattern, togglePattern, musicOn, musicAvailable, toggleMusic } = useAppSettings();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setAlias(user.chef_alias);
      setIcon(user.profile_icon);
    }
  }, [user]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--yi-paper)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ ...mono, fontSize: "0.6rem", color: "var(--yi-muted)" }}>Young Investors</span>
      </div>
    );
  }

  const Icon = getProfileIcon(user.profile_icon);
  const credential = CREDENTIAL_LABEL[user.credential_status] ?? user.credential_status;

  async function handleSaveText() {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ chef_alias: alias.trim() || "Chef", profile_icon: icon });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is over 5MB. Pick a smaller one.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await updateProfile({ profile_picture: file });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — your icon still stands.");
    } finally {
      setUploading(false);
    }
  }

  const scores: { label: string; value: number }[] = [
    { label: "Academy", value: user.academy_score },
    { label: "JSE Market", value: user.jse_market_score },
    { label: "Risk & Return", value: user.risk_return_score },
    { label: "Kitchen", value: user.kitchen_score },
    { label: "Personal Prediction", value: user.personal_prediction_score },
    { label: "Kitchen Prediction", value: user.kitchen_prediction_score },
  ];

  const topScore = scores.reduce((best, score) => (score.value > best.value ? score : best), scores[0]);
  const chefNumber = user.member_number != null ? String(user.member_number).padStart(3, "0") : "---";

  async function shareHallmark() {
    if (!user) return;
    const text = `Young Investors Chef ${user.chef_alias} / Chef No. ${chefNumber} / ${user.rank} / Academy ${user.academy_score}/100 / Kitchen ${user.kitchen_score}/100`;
    setShareNotice(null);
    try {
      if (navigator.share) {
        await navigator.share({ title: `Chef ${user.chef_alias}`, text, url: window.location.href });
        setShareNotice("Share sheet opened.");
      } else {
        await navigator.clipboard.writeText(text);
        setShareNotice("Profile caption copied.");
      }
    } catch {
      setShareNotice("Share cancelled.");
    }
  }

  return (
    <main style={{ minHeight: "100svh", background: "var(--yi-paper)", color: "var(--yi-ink)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 2, background: "var(--yi-ink)" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
        <Link href="/lobby" style={{ ...mono, fontSize: "0.6rem", color: "var(--yi-ink)", textDecoration: "underline" }}>
          ← Lobby
        </Link>
        <span style={{ ...mono, fontSize: "0.56rem", letterSpacing: "0.18em", color: "var(--yi-muted)" }}>
          {isLocalMode ? "Local demo" : "Chef Profile"}
        </span>
      </div>

      <div style={{ padding: "8px 20px 40px", maxWidth: 600, width: "100%", margin: "0 auto" }}>
        <FocusNag style={{ marginBottom: 16 }} />
        {/* Screenshot-ready hallmark */}
        <section
          aria-label="Chef hallmark"
          style={{
            background: "#050505",
            color: "#ffffff",
            border: "1px solid #050505",
            padding: "18px",
            marginBottom: 18,
            display: "grid",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <p style={{ ...mono, fontSize: "0.52rem", color: "rgba(255,255,255,0.62)", margin: 0 }}>Young Investors / Chef Hallmark</p>
              <h1 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(2.2rem,11vw,4rem)", lineHeight: 0.88, letterSpacing: 0, margin: "8px 0 0", color: "#ffffff" }}>
                Chef<br />{user.chef_alias}
              </h1>
            </div>
            <div style={{ width: 74, height: 74, border: "1px solid rgba(255,255,255,0.42)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {user.profile_picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profile_picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Icon size={36} strokeWidth={1.25} aria-hidden />
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", border: "1px solid rgba(255,255,255,0.2)" }}>
            {[
              ["No.", chefNumber],
              ["Rank", user.rank],
              ["Kitchen", user.current_kitchen],
            ].map(([label, value], i) => (
              <div key={label} style={{ padding: "10px 9px", borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.2)", minWidth: 0 }}>
                <p style={{ ...mono, fontSize: "0.45rem", color: "rgba(255,255,255,0.52)", margin: 0 }}>{label}</p>
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.68rem", color: "#fff", margin: "5px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {scores.slice(0, 4).map((score) => (
              <div key={score.label} style={{ display: "grid", gridTemplateColumns: "112px 1fr 42px", alignItems: "center", gap: 8 }}>
                <span style={{ ...mono, fontSize: "0.48rem", color: "rgba(255,255,255,0.58)" }}>{score.label}</span>
                <span style={{ height: 6, background: "rgba(255,255,255,0.16)", position: "relative" }}>
                  <span style={{ position: "absolute", inset: 0, right: `${100 - score.value}%`, background: "#ffffff" }} />
                </span>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", textAlign: "right", color: "#ffffff" }}>{score.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <p style={{ ...mono, fontSize: "0.48rem", color: "rgba(255,255,255,0.62)", margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <BadgeCheck size={12} strokeWidth={1.8} aria-hidden /> Signature strength: {topScore.label}
            </p>
            <button type="button" onClick={shareHallmark} style={{ ...mono, minHeight: 38, padding: "0 13px", background: "#ffffff", color: "#050505", border: "1px solid #ffffff", fontSize: "0.58rem", display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <Share2 size={13} strokeWidth={1.9} aria-hidden /> Share
            </button>
          </div>
        </section>
        {shareNotice && <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: "-8px 0 14px" }}>{shareNotice}</p>}

        {/* Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--yi-hairline)", paddingBottom: 22 }}>
          <div style={{ position: "relative", width: 76, height: 76, border: "1px solid var(--yi-ink)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "var(--yi-paper)" }}>
            {user.profile_picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profile_picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Icon size={36} strokeWidth={1.4} aria-hidden />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.6rem,7vw,2.2rem)", fontWeight: 700, lineHeight: 1, margin: 0 }}>
              Chef {user.chef_alias}
            </h1>
            <p style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", margin: "8px 0 0" }}>
              {user.member_number != null ? `Chef No. ${String(user.member_number).padStart(3, "0")} · ` : ""}
              {user.rank}
            </p>
            <p style={{ ...mono, fontSize: "0.52rem", color: "var(--yi-muted)", margin: "4px 0 0" }}>
              {user.current_kitchen}
            </p>
          </div>
        </div>

        {/* Photo + edit actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <label style={{ ...btnGhost, cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.5 : 1 }}>
            {uploading ? "Uploading…" : user.profile_picture ? "Change photo" : "Upload photo"}
            <input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} style={{ display: "none" }} />
          </label>
          <button type="button" onClick={() => setEditing((v) => !v)} style={btnGhost}>
            {editing ? "Close" : "Edit alias & icon"}
          </button>
        </div>

        {error && <p style={{ ...mono, fontSize: "0.58rem", color: "#b42318", margin: "12px 0 0" }}>{error}</p>}

        {/* Edit panel */}
        {editing && (
          <div style={{ border: "1px solid var(--yi-ink)", padding: "16px", marginTop: 16 }}>
            <label style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", display: "block", marginBottom: 8 }}>Chef alias</label>
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              style={{ width: "100%", border: "none", borderBottom: "2px solid var(--yi-ink)", padding: "8px 0", fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.2rem", outline: "none", background: "transparent" }}
            />
            <label style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", display: "block", margin: "18px 0 8px" }}>Profile icon</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 8 }}>
              {PROFILE_ICONS.map(({ key, label, Icon: I }) => {
                const active = icon === key;
                return (
                  <button key={key} type="button" onClick={() => setIcon(key)} title={label} aria-pressed={active}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", border: active ? "2px solid var(--yi-ink)" : "1px solid var(--yi-frame)", background: active ? "var(--yi-ink)" : "var(--yi-paper)", color: active ? "var(--yi-paper)" : "var(--yi-ink)", cursor: "pointer" }}>
                    <I size={20} strokeWidth={1.6} aria-hidden />
                    <span style={{ ...mono, fontSize: "0.46rem" }}>{label}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={handleSaveText} disabled={saving}
              style={{ ...mono, marginTop: 16, minHeight: 44, padding: "0 22px", background: "var(--yi-ink)", color: "var(--yi-paper)", border: "none", fontSize: "0.7rem", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save changes →"}
            </button>
          </div>
        )}

        {/* Scores */}
        <p style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", margin: "26px 0 10px" }}>Scores · demo / simulation</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid var(--yi-hairline)" }}>
          {scores.map((s, i) => (
            <div key={s.label} style={{ padding: "14px 14px", borderRight: i % 2 === 0 ? "1px solid var(--yi-hairline)" : "none", borderTop: i >= 2 ? "1px solid var(--yi-hairline)" : "none" }}>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.5rem", fontWeight: 700, color: "var(--yi-ink)" }}>{s.value}</span>
              <span style={{ ...mono, fontSize: "0.6rem", color: "var(--yi-muted)" }}> /100</span>
              <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: "4px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          <div style={{ border: "1px solid var(--yi-hairline)", padding: "12px 14px" }}>
            <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: 0 }}>Microcredential</p>
            <p style={{ ...mono, fontSize: "0.72rem", color: user.credential_status === "cleared" ? "#167a3a" : "var(--yi-ink)", margin: "6px 0 0" }}>{credential}</p>
          </div>
          <div style={{ border: "1px solid var(--yi-hairline)", padding: "12px 14px" }}>
            <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: 0 }}>Attempts used</p>
            <p style={{ ...mono, fontSize: "0.72rem", color: "var(--yi-ink)", margin: "6px 0 0" }}>{user.attempts_used} / 3</p>
          </div>
        </div>

        {/* Settings */}
        <p style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", margin: "26px 0 10px" }}>Settings</p>
        <div style={{ border: "1px solid var(--yi-hairline)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "0.92rem", color: "var(--yi-ink)", margin: 0 }}>Night mode</p>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.55rem", color: "var(--yi-muted)", margin: "4px 0 0" }}>Dark theme across the dashboard</p>
          </div>
          <button type="button" onClick={toggleTheme} aria-pressed={theme === "dark"} style={{ ...btnGhost, minWidth: 76, justifyContent: "center" }}>
            {theme === "dark" ? "On" : "Off"}
          </button>
        </div>

        {/* Background pattern */}
        <div style={{ border: "1px solid var(--yi-hairline)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
          <div>
            <p style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "0.92rem", color: "var(--yi-ink)", margin: 0 }}>Background pattern</p>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.55rem", color: "var(--yi-muted)", margin: "4px 0 0" }}>Subtle Young Investors texture</p>
          </div>
          <button type="button" onClick={togglePattern} aria-pressed={pattern} style={{ ...btnGhost, minWidth: 76, justifyContent: "center" }}>
            {pattern ? "On" : "Off"}
          </button>
        </div>

        {/* Music */}
        <div style={{ border: "1px solid var(--yi-hairline)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
          <div>
            <p style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "0.92rem", color: "var(--yi-ink)", margin: 0 }}>Music</p>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.55rem", color: "var(--yi-muted)", margin: "4px 0 0" }}>
              {musicAvailable ? "Plays on every page" : "Add a track at public/audio/lounge.mp3"}
            </p>
          </div>
          <button type="button" onClick={toggleMusic} disabled={!musicAvailable} aria-pressed={musicOn} style={{ ...btnGhost, minWidth: 76, justifyContent: "center", opacity: musicAvailable ? 1 : 0.5 }}>
            {musicOn ? "On" : "Off"}
          </button>
        </div>

        {/* Language — provisional. Multilingual access still in development. */}
        <div style={{ border: "1px solid var(--yi-hairline)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
          <div>
            <p style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "0.92rem", color: "var(--yi-ink)", margin: 0 }}>Language</p>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.55rem", color: "var(--yi-muted)", margin: "4px 0 0" }}>Multilingual access is in development</p>
          </div>
          <select
            defaultValue="en"
            aria-label="Language (preview)"
            style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", padding: "9px 10px", border: "1px solid var(--yi-frame)", background: "transparent", color: "var(--yi-ink)", minHeight: 42 }}
          >
            <option value="en">English</option>
            <option value="zu">isiZulu — soon</option>
            <option value="xh">isiXhosa — soon</option>
            <option value="af">Afrikaans — soon</option>
            <option value="st">Sesotho — soon</option>
            <option value="sn">Shona — soon</option>
          </select>
        </div>

        {/* Gordon's Guide diagnostic */}
        <div style={{ margin: "24px 0 0", border: "1px solid var(--yi-frame)", padding: "16px" }}>
          <p style={{ ...mono, fontSize: "0.56rem", color: "var(--yi-muted)", margin: "0 0 6px" }}>Gordon&apos;s Guide · Baseline Diagnostic</p>
          <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", margin: "0 0 14px", lineHeight: 1.55 }}>
            A 10-question financial health check. Gordon reads your starting point and names your band — from Burn Risk to Master Chef Mode.
          </p>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            style={{ ...btnGhost, fontSize: "0.62rem" }}
          >
            Take Gordon&apos;s Guide →
          </button>
        </div>

        {/* Reserved seats note — the brand metaphor */}
        <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: "22px 0 0", lineHeight: 1.7 }}>
          Chef No. {String(RESERVED_CHEFS.gordon.number).padStart(3, "0")} is {RESERVED_CHEFS.gordon.name}.
          Chef No. {String(RESERVED_CHEFS.sicilia.number).padStart(3, "0")} is {RESERVED_CHEFS.sicilia.name}.
          Founding Chefs are numbered from {String(FIRST_TESTER_NUMBER).padStart(3, "0")}.
        </p>

        <p style={{ ...mono, fontSize: "0.5rem", color: "var(--yi-muted)", margin: "10px 0 0", lineHeight: 1.7 }}>
          Educational simulation · No live execution · Not financial advice · Mock market data
        </p>
      </div>

      {guideOpen && <GordonGuideSheet onClose={() => setGuideOpen(false)} />}
    </main>
  );
}

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const btnGhost: React.CSSProperties = {
  ...mono,
  fontSize: "0.6rem",
  color: "var(--yi-ink)",
  background: "transparent",
  border: "1px solid var(--yi-ink)",
  padding: "10px 16px",
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",
};
