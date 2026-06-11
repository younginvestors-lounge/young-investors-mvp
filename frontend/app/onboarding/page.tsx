"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { profileIsOnboarded } from "@/lib/profileStore";
import { PROFILE_ICONS } from "@/lib/profileIcons";

const INTENTS = [
  { label: "Learn the craft", value: "learn_craft" },
  { label: "Build my portfolio", value: "build_portfolio" },
  { label: "Start a Kitchen", value: "start_kitchen" },
] as const;

type StepKey = "display" | "alias" | "age" | "intent" | "icon" | "confirm";

const STEPS: StepKey[] = ["display", "alias", "age", "intent", "icon", "confirm"];

export default function OnboardingPage() {
  const router = useRouter();
  const { updateProfile, user, isAuthenticated, isLoading } = useAuth();

  const completingRef = useRef(false);
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [alias, setAlias] = useState("");
  const [age, setAge] = useState("");
  const [intent, setIntent] = useState("");
  const [icon, setIcon] = useState("chef-default");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cur = STEPS[Math.min(step, STEPS.length - 1)];
  const total = STEPS.length;
  const ageNum = Number(age);
  const ageInvalid = age !== "" && (Number.isNaN(ageNum) || ageNum < 13 || ageNum > 99);
  const isTrainingKitchen = !ageInvalid && age !== "" && ageNum < 18;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (profileIsOnboarded(user) && !completingRef.current) {
      router.replace("/kitchen");
      return;
    }

    setDisplayName((value) => value || user.display_name || user.chef_alias || "");
    setAlias((value) => value || user.chef_alias || "");
    setAge((value) => value || (user.age == null ? "" : String(user.age)));
    setIntent((value) => value || user.intent || "");
    setIcon((value) => value || user.profile_icon || "chef-default");
  }, [isLoading, isAuthenticated, user, router]);

  const selectedIntent = useMemo(() => INTENTS.find((item) => item.value === intent)?.label ?? "", [intent]);
  const selectedIcon = useMemo(() => PROFILE_ICONS.find((item) => item.key === icon), [icon]);

  function canAdvance(): boolean {
    switch (cur) {
      case "display":
        return displayName.trim().length >= 2;
      case "alias":
        return alias.trim().length >= 2;
      case "age":
        return age !== "" && !ageInvalid;
      case "intent":
        return intent !== "";
      case "icon":
        return icon !== "";
      case "confirm":
        return !submitting;
      default:
        return false;
    }
  }

  async function finishOnboarding() {
    if (!user || submitting) return;
    completingRef.current = true;
    setSubmitting(true);
    setFormError(null);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        chef_alias: alias.trim(),
        age: ageNum,
        intent,
        profile_icon: icon,
        mode: ageNum < 18 ? "training_kitchen" : "full_simulation",
        onboarding_completed: true,
      });
      router.replace("/gordon-intro");
    } catch (err) {
      completingRef.current = false;
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("We could not save onboarding. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function advance() {
    if (!canAdvance()) return;
    setFormError(null);
    if (cur === "confirm") {
      void finishOnboarding();
      return;
    }
    setStep((value) => Math.min(value + 1, total - 1));
  }

  function back() {
    setFormError(null);
    setStep((value) => Math.max(value - 1, 0));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && cur !== "intent" && cur !== "icon" && cur !== "confirm") {
      advance();
    }
  }

  if (isLoading || !isAuthenticated || !user) {
    return (
      <main className="auth-loading">
        <span>Young Investors</span>
      </main>
    );
  }

  return (
    <main className="auth-page auth-onboarding-page">
      <div className="auth-progress" aria-hidden>
        <span style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>

      <header className="auth-header">
        <span className="auth-wordmark">Young Investors</span>
        <span className="auth-tag">
          {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </header>

      <section key={cur} className="onboarding-panel auth-step-panel">
        {cur === "display" && (
          <>
            <p className="auth-kicker">Profile setup</p>
            <h1 className="auth-onboarding-title">What name should your account carry?</h1>
            <p className="auth-note">This can be your real first name or a display name. Your Chef alias comes next.</p>
            <label className="auth-label" htmlFor="display-name">Display name</label>
            <input
              id="display-name"
              className="auth-big-input"
              autoComplete="name"
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Your name"
            />
          </>
        )}

        {cur === "alias" && (
          <>
            <p className="auth-kicker">Chef alias</p>
            <h1 className="auth-onboarding-title">What should the Kitchen call you?</h1>
            <p className="auth-note">This is your public Young Investors username inside the app, not your login credential.</p>
            <label className="auth-label" htmlFor="chef-alias">Chef alias</label>
            <input
              id="chef-alias"
              className="auth-big-input"
              autoComplete="nickname"
              autoFocus
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Chef ___"
            />
          </>
        )}

        {cur === "age" && (
          <>
            <p className="auth-kicker">Age band</p>
            <h1 className="auth-onboarding-title">How old are you, Chef {alias || "Chef"}?</h1>
            <p className="auth-note">
              Under-18 profiles stay in Training Kitchen mode. No banking, broker, payment, or live-trading flow exists here.
            </p>
            <label className="auth-label" htmlFor="age">Age</label>
            <input
              id="age"
              className="auth-big-input"
              type="number"
              min={13}
              max={99}
              autoFocus
              value={age}
              onChange={(e) => setAge(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="__"
              aria-invalid={ageInvalid}
            />
            {ageInvalid && <p className="auth-error">Enter an age from 13 to 99.</p>}
            {isTrainingKitchen && <p className="auth-note">Training Kitchen mode will be applied automatically.</p>}
          </>
        )}

        {cur === "intent" && (
          <>
            <p className="auth-kicker">Intent</p>
            <h1 className="auth-onboarding-title">What are you cooking toward?</h1>
            <div className="onboarding-options">
              {INTENTS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIntent(opt.value)}
                  className={intent === opt.value ? "onboarding-option-active" : ""}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        {cur === "icon" && (
          <>
            <p className="auth-kicker">Profile mark</p>
            <h1 className="auth-onboarding-title">Pick your mark.</h1>
            <p className="auth-note">You can upload a profile picture later from your profile when storage is configured.</p>
            <div className="onboarding-icon-grid">
              {PROFILE_ICONS.map(({ key, label, Icon }) => {
                const active = icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    aria-pressed={active}
                    title={label}
                    className={active ? "onboarding-icon-active" : ""}
                  >
                    <Icon size={28} strokeWidth={1.7} aria-hidden />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {cur === "confirm" && (
          <>
            <p className="auth-kicker">Confirmation</p>
            <h1 className="auth-onboarding-title">Ready for Follow the Money?</h1>
            <div className="onboarding-summary">
              <p><b>Name</b><span>{displayName}</span></p>
              <p><b>Chef alias</b><span>{alias}</span></p>
              <p><b>Mode</b><span>{isTrainingKitchen ? "Training Kitchen" : "Full simulation"}</span></p>
              <p><b>Intent</b><span>{selectedIntent}</span></p>
              <p><b>Mark</b><span>{selectedIcon?.label ?? "Chef"}</span></p>
            </div>
            <p className="auth-note">Academy clearance comes before Kitchen participation. This remains paper trading only.</p>
          </>
        )}

        {formError && <p role="alert" className="auth-error">{formError}</p>}

        <div className="onboarding-actions">
          {step > 0 && (
            <button type="button" className="auth-secondary" onClick={back}>
              Back
            </button>
          )}
          <button type="button" className="auth-primary" onClick={advance} disabled={!canAdvance()}>
            {cur === "confirm" ? (submitting ? "Saving..." : "Meet Gordon") : "Continue"}
          </button>
        </div>
      </section>

      <p className="auth-legal">MOCK_MVP_PAPER_TRADING_ONLY - educational simulation - no real money.</p>
    </main>
  );
}
