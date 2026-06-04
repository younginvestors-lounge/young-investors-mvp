"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { PROFILE_ICONS } from "@/lib/profileIcons";

const INTENTS = [
  { label: "Learn the craft", value: "learn_craft" },
  { label: "Build my portfolio", value: "build_portfolio" },
  { label: "Start a Kitchen", value: "start_kitchen" },
] as const;

const TOTAL = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [step, setStep] = useState(0);
  const [alias, setAlias] = useState("");
  const [age, setAge] = useState("");
  const [intent, setIntent] = useState("");
  const [icon, setIcon] = useState("chef-default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ageNum = Number(age);
  // 18+ only for now. A Young Investors Junior Academy will open for under-18s later.
  const ageInvalid = age !== "" && (ageNum < 18 || Number.isNaN(ageNum));

  function canAdvance(): boolean {
    if (step === 0) return alias.trim().length > 0;
    if (step === 1) return age !== "" && ageNum >= 18 && !Number.isNaN(ageNum);
    if (step === 2) return intent !== "";
    if (step === 3) return icon !== "";
    if (step === 4) return email.trim() !== "" && password.length >= 8 && confirm.length >= 8;
    return false;
  }

  async function advance() {
    if (!canAdvance() || submitting) return;
    if (step < TOTAL - 1) {
      setStep((s) => s + 1);
      return;
    }
    // Final step — create the account.
    setFormError(null);
    setFieldErrors({});
    if (password !== confirm) {
      setFieldErrors({ password_confirm: "Passwords do not match." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await signup({
        email: email.trim(),
        username: email.trim(), // email-first auth; username kept unique = email
        password,
        password_confirm: confirm,
        chef_alias: alias.trim(),
        age: ageNum,
        intent,
        profile_icon: icon,
      });
      // Session already issued (Supabase email-confirm off, or local demo) → into the
      // first-session briefing with Gordon & Sicilia. Otherwise confirm email first.
      if (res.needsEmailConfirm) {
        router.push("/verify-email");
      } else {
        router.replace("/gordon-intro");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setFormError(Object.keys(err.fieldErrors).length === 0 ? err.message : null);
        // Jump back to the email/password step if the problem is there.
        if (err.fieldErrors.email || err.fieldErrors.username || err.fieldErrors.password) {
          setStep(4);
        }
      } else {
        setFormError("Something went wrong creating your account.");
      }
      setSubmitting(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && step !== 3) advance();
  }

  return (
    <main style={{ minHeight: "100svh", background: "#fff", color: "#111", display: "flex", flexDirection: "column", padding: "0 0 40px" }}>
      {/* Progress */}
      <div style={{ height: 2, background: "#eee", flexShrink: 0 }}>
        <div style={{ height: "100%", background: "#111", width: `${((step + 1) / TOTAL) * 100}%`, transition: "width 300ms ease" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "20px 24px 0" }}>
        <span style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.1rem", fontWeight: 700 }}>Young Investors</span>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.68rem", letterSpacing: "0.1em", color: "#888" }}>
          {String(step + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>
      </div>

      <div style={{ flex: 1, padding: "40px 24px 32px", maxWidth: 540, width: "100%" }}>
        {/* STEP 0 — alias */}
        {step === 0 && (
          <>
            <h1 style={heading}>What should we call you, Chef?</h1>
            <p style={sub}>Your kitchen alias. Make it yours.</p>
            <input autoFocus value={alias} onChange={(e) => setAlias(e.target.value)} onKeyDown={onKeyDown} placeholder="Chef ___" style={bigInput} />
          </>
        )}

        {/* STEP 1 — age */}
        {step === 1 && (
          <>
            <h1 style={heading}>How old are you, Chef {alias}?</h1>
            <p style={sub}>Young Investors is 18+ for now. A Junior Academy is coming for younger chefs.</p>
            <input autoFocus type="number" min={18} max={99} value={age} onChange={(e) => setAge(e.target.value)} onKeyDown={onKeyDown} placeholder="__"
              style={{ ...bigInput, borderBottomColor: ageInvalid ? "#b42318" : "#111" }} />
            {ageInvalid && <p style={errLine}>You must be 18 or older to enter. Junior Academy coming soon.</p>}
          </>
        )}

        {/* STEP 2 — intent */}
        {step === 2 && (
          <>
            <h1 style={heading}>What are you cooking toward?</h1>
            <div style={{ border: "1px solid #111", marginTop: 24 }}>
              {INTENTS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setIntent(opt.value)}
                  style={{ display: "block", width: "100%", padding: "16px 18px", border: "none", borderBottom: "1px solid #ddd",
                    background: intent === opt.value ? "#111" : "#fff", color: intent === opt.value ? "#fff" : "#111",
                    fontFamily: "var(--font-archivo), sans-serif", fontSize: "1rem", textAlign: "left", cursor: "pointer" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 3 — profile icon */}
        {step === 3 && (
          <>
            <h1 style={heading}>Pick your mark.</h1>
            <p style={sub}>Choose an icon for your Chef profile. You can upload a selfie later from your profile.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 10, marginTop: 8 }}>
              {PROFILE_ICONS.map(({ key, label, Icon }) => {
                const active = icon === key;
                return (
                  <button key={key} type="button" onClick={() => setIcon(key)} aria-pressed={active} title={label}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 6px",
                      border: active ? "2px solid #111" : "1px solid #ddd", background: active ? "#111" : "#fff",
                      color: active ? "#fff" : "#111", cursor: "pointer" }}>
                    <Icon size={26} strokeWidth={1.6} aria-hidden />
                    <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* STEP 4 — credentials */}
        {step === 4 && (
          <>
            <h1 style={heading}>Secure your seat.</h1>
            <p style={sub}>Real account. Your progress, Vault, and Kitchen are saved to it.</p>

            <label style={label} htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKeyDown} placeholder="you@example.com"
              style={{ ...bigInput, fontSize: "1.05rem", borderBottomColor: fieldErrors.email || fieldErrors.username ? "#b42318" : "#111" }} />
            {(fieldErrors.email || fieldErrors.username) && <p style={errLine}>{fieldErrors.email || fieldErrors.username}</p>}

            <label style={{ ...label, marginTop: 22 }} htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKeyDown} placeholder="At least 8 characters"
              style={{ ...bigInput, fontSize: "1.05rem", borderBottomColor: fieldErrors.password ? "#b42318" : "#111" }} />
            {fieldErrors.password && <p style={errLine}>{fieldErrors.password}</p>}

            <label style={{ ...label, marginTop: 22 }} htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={onKeyDown} placeholder="Repeat it"
              style={{ ...bigInput, fontSize: "1.05rem", borderBottomColor: fieldErrors.password_confirm ? "#b42318" : "#111" }} />
            {fieldErrors.password_confirm && <p style={errLine}>{fieldErrors.password_confirm}</p>}

            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", color: "#aaa", margin: "18px 0 0", lineHeight: 1.6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              We&apos;ll email you a verification link before your first cook.
            </p>
          </>
        )}

        {formError && <p role="alert" style={{ ...errLine, marginTop: 20 }}>{formError}</p>}

        {/* Continue */}
        <button type="button" onClick={advance} disabled={!canAdvance() || submitting}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "13px 28px", marginTop: 36,
            background: "#111", color: "#fff", border: "none", fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem",
            textTransform: "uppercase", letterSpacing: "0.12em", minHeight: 48,
            opacity: !canAdvance() || submitting ? 0.35 : 1, cursor: !canAdvance() || submitting ? "default" : "pointer", transition: "opacity 180ms ease" }}>
          {step < TOTAL - 1 ? "Continue →" : submitting ? "Creating account…" : "Create my account →"}
        </button>

        {step === 0 && (
          <p style={{ marginTop: 18 }}>
            <Link href="/signin" style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#111", textDecoration: "underline" }}>
              Already cooking with us? Sign in →
            </Link>
          </p>
        )}
      </div>

      <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#bbb", textAlign: "center", margin: 0, padding: "0 24px" }}>
        Paper trading only · No real money
      </p>
    </main>
  );
}

const heading: React.CSSProperties = { fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.8rem, 6vw, 2.6rem)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 10px" };
const sub: React.CSSProperties = { fontFamily: "var(--font-archivo), sans-serif", fontSize: "0.88rem", color: "#888", margin: "0 0 24px", lineHeight: 1.5 };
const bigInput: React.CSSProperties = { width: "100%", border: "none", borderBottom: "2px solid #111", background: "transparent", color: "#111", padding: "10px 0", fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "1.4rem", outline: "none" };
const label: React.CSSProperties = { display: "block", fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#888", marginBottom: 8 };
const errLine: React.CSSProperties = { fontFamily: "var(--font-mono), monospace", fontSize: "0.64rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#b42318", margin: "10px 0 0", lineHeight: 1.5 };
