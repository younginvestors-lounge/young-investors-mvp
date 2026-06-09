"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { profileIsOnboarded } from "@/lib/profileStore";

const GREETINGS = [
  { word: "Hello", lang: "English" },
  { word: "Sawubona", lang: "isiZulu" },
  { word: "Molo", lang: "isiXhosa" },
  { word: "Hallo", lang: "Afrikaans" },
  { word: "Dumela", lang: "Sesotho" },
  { word: "Thobela", lang: "Sepedi" },
  { word: "Avuxeni", lang: "xiTsonga" },
  { word: "Ndaa", lang: "Tshivenda" },
  { word: "Mhoro", lang: "Shona" },
  { word: "Jambo", lang: "Kiswahili" },
  { word: "Aweh", lang: "SA Slang" },
];

type AuthMode = "entry" | "signup-email" | "signin-email";

export default function LoginPage() {
  const router = useRouter();
  const { signup, login, resendVerification, user, isAuthenticated, isLoading, isLocalMode } = useAuth();

  const [mode, setMode] = useState<AuthMode>("entry");
  const [greetingIndex, setGreetingIndex] = useState(0);

  const [signupEmail, setSignupEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [chefAlias, setChefAlias] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    router.replace(profileIsOnboarded(user) ? "/kitchen" : "/onboarding");
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGreetingIndex((idx) => (idx + 1) % GREETINGS.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  function resetFeedback(nextMode: AuthMode) {
    setMode(nextMode);
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setUnverified(false);
  }

  const signupReady =
    signupEmail.trim() !== "" &&
    displayName.trim() !== "" &&
    chefAlias.trim() !== "" &&
    signupPassword.length >= 8 &&
    signupConfirm.length >= 8 &&
    !submitting;

  const signinReady = signinEmail.trim() !== "" && signinPassword !== "" && !submitting;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!signupReady) return;

    if (signupPassword !== signupConfirm) {
      setFieldErrors({ password_confirm: "Passwords do not match." });
      setFormError(null);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    try {
      const result = await signup({
        email: signupEmail.trim(),
        username: signupEmail.trim(),
        password: signupPassword,
        password_confirm: signupConfirm,
        display_name: displayName.trim(),
        chef_alias: chefAlias.trim(),
        profile_icon: "chef-default",
      });

      if (result.needsEmailConfirm) {
        router.push("/verify-email");
        return;
      }

      router.replace(profileIsOnboarded(result.user) ? "/kitchen" : "/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setFormError(Object.keys(err.fieldErrors).length === 0 ? err.message : null);
      } else {
        setFormError("We could not create your Chef profile. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    if (!signinReady) return;

    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);
    setNotice(null);
    setUnverified(false);
    try {
      const profile = await login({ email: signinEmail.trim(), password: signinPassword });
      router.replace(profileIsOnboarded(profile) ? "/kitchen" : "/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setUnverified(err.code === "email_unverified");
      } else {
        setFormError("We could not sign you in. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendVerification() {
    const cleanEmail = signinEmail.trim() || signupEmail.trim();
    if (!cleanEmail || resending) return;
    setResending(true);
    setNotice(null);
    try {
      await resendVerification(cleanEmail);
      setNotice("If that Chef profile is waiting for confirmation, a fresh link is on its way.");
    } catch {
      setNotice("We could not send a fresh link right now. Check the email and try again.");
    } finally {
      setResending(false);
    }
  }

  const greeting = GREETINGS[greetingIndex];

  return (
    <main className="auth-page">
      <div className="auth-rule" />

      <header className="auth-header">
        <span className="auth-wordmark">Young Investors</span>
        <span className="auth-tag">MOCK_MVP_PAPER_TRADING_ONLY</span>
      </header>

      <div className="auth-login-grid">
        <section className="auth-brand-panel" aria-label="Young Investors">
          <p className="auth-kicker">Finance is easier with a Kitchen.</p>
          <h1 className="auth-hero">
            <span>{greeting.word}</span>
            <small>{greeting.lang}</small>
          </h1>
          <p className="auth-copy">
            Learn first, propose second, vote at the table, and keep every move inside the paper-trading boundary.
          </p>
          <div className="auth-proof-grid" aria-label="Young Investors safeguards">
            <span>Academy before Kitchen</span>
            <span>60% rule before execution</span>
            <span>Gordon risk review</span>
          </div>
        </section>

        <section key={mode} className="auth-action-panel auth-step-panel" aria-live="polite">
          {mode === "entry" && (
            <>
              <div>
                <p className="auth-kicker">New with us?</p>
                <h2 className="auth-panel-title">Start your Chef profile.</h2>
              </div>
              <GoogleSignInButton label="Sign up with Google" />
              <button type="button" className="auth-primary" onClick={() => resetFeedback("signup-email")}>
                Sign up with email
              </button>

              <div className="auth-divider" aria-hidden>
                <span />
                <b>or</b>
                <span />
              </div>

              <div>
                <p className="auth-kicker">Already cooking with us?</p>
                <h2 className="auth-panel-title">Return to your Kitchen.</h2>
              </div>
              <GoogleSignInButton label="Sign in with Google" />
              <button type="button" className="auth-secondary" onClick={() => resetFeedback("signin-email")}>
                Sign in with email
              </button>
              {isLocalMode && (
                <p className="auth-note">Local demo mode uses your browser only. No Supabase OAuth buttons are shown here.</p>
              )}
            </>
          )}

          {mode === "signup-email" && (
            <form onSubmit={handleSignup} noValidate className="auth-form">
              <button type="button" className="auth-back" onClick={() => resetFeedback("entry")}>Back</button>
              <div>
                <p className="auth-kicker">New with us</p>
                <h2 className="auth-panel-title">Create the auth account first.</h2>
                <p className="auth-note">Your Chef alias is your public YI name. Your email stays the login credential.</p>
              </div>

              <label className="auth-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                autoFocus
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {(fieldErrors.email || fieldErrors.username) && <p className="auth-error">{fieldErrors.email || fieldErrors.username}</p>}

              <label className="auth-label" htmlFor="display-name">Display name</label>
              <input
                id="display-name"
                className="auth-input"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />

              <label className="auth-label" htmlFor="chef-alias">Chef alias</label>
              <input
                id="chef-alias"
                className="auth-input"
                type="text"
                autoComplete="nickname"
                value={chefAlias}
                onChange={(e) => setChefAlias(e.target.value)}
                placeholder="Chef ___"
              />
              {fieldErrors.chef_alias && <p className="auth-error">{fieldErrors.chef_alias}</p>}

              <label className="auth-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                className="auth-input"
                type="password"
                autoComplete="new-password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
              {fieldErrors.password && <p className="auth-error">{fieldErrors.password}</p>}

              <label className="auth-label" htmlFor="signup-confirm">Confirm password</label>
              <input
                id="signup-confirm"
                className="auth-input"
                type="password"
                autoComplete="new-password"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                placeholder="Repeat it"
              />
              {fieldErrors.password_confirm && <p className="auth-error">{fieldErrors.password_confirm}</p>}

              {formError && <p role="alert" className="auth-error">{formError}</p>}
              {notice && <p role="status" className="auth-note">{notice}</p>}

              <button type="submit" className="auth-primary" disabled={!signupReady}>
                {submitting ? "Creating..." : "Create account"}
              </button>
            </form>
          )}

          {mode === "signin-email" && (
            <form onSubmit={handleSignin} noValidate className="auth-form">
              <button type="button" className="auth-back" onClick={() => resetFeedback("entry")}>Back</button>
              <div>
                <p className="auth-kicker">Already cooking</p>
                <h2 className="auth-panel-title">Sign in with email.</h2>
              </div>

              <label className="auth-label" htmlFor="signin-email">Email</label>
              <input
                id="signin-email"
                className="auth-input"
                type="email"
                autoComplete="email"
                autoFocus
                value={signinEmail}
                onChange={(e) => setSigninEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <label className="auth-label" htmlFor="signin-password">Password</label>
              <input
                id="signin-password"
                className="auth-input"
                type="password"
                autoComplete="current-password"
                value={signinPassword}
                onChange={(e) => setSigninPassword(e.target.value)}
                placeholder="Your password"
              />

              <Link href="/reset-password" className="auth-link">Forgot password?</Link>

              {formError && (
                <p role="alert" className="auth-error">
                  {formError}
                  {unverified && (
                    <>
                      {" "}
                      <button type="button" className="auth-inline" onClick={handleResendVerification} disabled={resending}>
                        {resending ? "Sending..." : "Resend verification"}
                      </button>
                    </>
                  )}
                </p>
              )}
              {notice && <p role="status" className="auth-note">{notice}</p>}

              <button type="submit" className="auth-primary" disabled={!signinReady}>
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}

          <p className="auth-legal">
            Educational simulation only. No real money, custody, broker connection, or financial advice.
          </p>
        </section>
      </div>
    </main>
  );
}
