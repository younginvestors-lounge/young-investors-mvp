"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

export default function SignInPage() {
  const router = useRouter();
  const { login, resendVerification } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim() !== "" && password !== "" && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setUnverified(false);
    setVerificationNotice(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.replace("/kitchen");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.code === "email_unverified") setUnverified(true);
      } else {
        setError("Something went wrong. Try again.");
      }
      setSubmitting(false);
    }
  }

  async function handleResendVerification() {
    const cleanEmail = email.trim();
    if (!cleanEmail || resendingVerification) return;
    setVerificationNotice(null);
    setResendingVerification(true);
    try {
      await resendVerification(cleanEmail);
      setVerificationNotice("If that account is still waiting for confirmation, a fresh link is on its way.");
    } catch {
      setVerificationNotice("We could not send a fresh link right now. Check the email and try again.");
    } finally {
      setResendingVerification(false);
    }
  }

  return (
    <main style={{ minHeight: "100svh", background: "#fff", color: "#111", display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <div style={{ height: 2, background: "#111" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "18px 24px 0" }}>
        <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Young Investors
        </span>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "#aaa" }}>
          We Cook.
        </span>
      </div>

      <div style={{ padding: "clamp(24px,6vw,52px) 24px 32px", maxWidth: 440, width: "100%" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", margin: "0 0 8px" }}>
          Welcome back, Chef
        </p>
        <h1 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(2rem,8vw,3rem)", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 28px" }}>
          Sign in.
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <label style={labelStyle} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 22 }} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />

          {error && (
            <p role="alert" style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", color: "#b42318", margin: "16px 0 0", lineHeight: 1.5 }}>
              {error}
              {unverified && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingVerification || !email.trim()}
                    style={inlineButtonStyle}
                  >
                    {resendingVerification ? "Sending..." : "Resend verification"}
                  </button>
                </>
              )}
            </p>
          )}
          {verificationNotice && (
            <p role="status" style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.62rem", color: "#555", margin: "10px 0 0", lineHeight: 1.5 }}>
              {verificationNotice}
            </p>
          )}

          <button type="submit" disabled={!canSubmit} style={{ ...primaryButton, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "default", marginTop: 28 }}>
            {submitting ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 10 }}>
          <Link href="/reset-password" style={linkStyle}>Forgot password?</Link>
          <Link href="/onboarding" style={linkStyle}>New here? Start your journey →</Link>
        </div>

        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.54rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#bbb", margin: "28px 0 0", lineHeight: 1.7 }}>
          Paper trading only · Educational simulation · Not financial advice
        </p>
      </div>

      <div style={{ borderTop: "1px solid #eee", padding: "12px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={footerStyle}>MOCK_MVP_PAPER_TRADING_ONLY</span>
        <span style={footerStyle}>Young Investors · We Cook</span>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.6rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#888",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderBottom: "2px solid #111",
  background: "transparent",
  color: "#111",
  padding: "10px 0",
  fontFamily: "var(--font-archivo), sans-serif",
  fontSize: "1.05rem",
  outline: "none",
  boxShadow: "none",
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 32px",
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  minHeight: 48,
  width: "100%",
};

const linkStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.6rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#111",
  textDecoration: "underline",
};

const inlineButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#b42318",
  cursor: "pointer",
  padding: 0,
  font: "inherit",
  textDecoration: "underline",
};

const footerStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.52rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#ccc",
};
