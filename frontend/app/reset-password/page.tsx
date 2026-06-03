"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  // Request-link mode
  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);

  // Set-new-password mode
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await apiClient.passwordResetRequest(email.trim());
      setRequested(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirm || submitting) return;
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.passwordResetConfirm(token as string, password, confirm);
      setDone(true);
      setTimeout(() => router.replace("/signin"), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: "100svh", background: "#fff", color: "#111", display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <div style={{ height: 2, background: "#111" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "18px 24px 0" }}>
        <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Young Investors</span>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "#aaa" }}>We Cook.</span>
      </div>

      <div style={{ padding: "clamp(24px,6vw,52px) 24px 32px", maxWidth: 440, width: "100%" }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", margin: "0 0 8px" }}>
          Password reset
        </p>

        {/* MODE 1: set a new password from token */}
        {token ? (
          done ? (
            <>
              <h1 style={heading}>Done.</h1>
              <p style={body}>Your password is set. Taking you to sign in…</p>
              <Link href="/signin" style={primaryButton}>Sign in →</Link>
            </>
          ) : (
            <>
              <h1 style={heading}>New password.</h1>
              <form onSubmit={handleConfirm} noValidate>
                <label style={label} htmlFor="pw">New password</label>
                <input id="pw" type="password" autoComplete="new-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" style={input} />
                <label style={{ ...label, marginTop: 22 }} htmlFor="pw2">Confirm password</label>
                <input id="pw2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat it" style={input} />
                {error && <p role="alert" style={errorText}>{error}</p>}
                <button type="submit" disabled={!password || !confirm || submitting} style={{ ...primaryButton, opacity: !password || !confirm || submitting ? 0.4 : 1, marginTop: 28 }}>
                  {submitting ? "Saving…" : "Set password →"}
                </button>
              </form>
            </>
          )
        ) : requested ? (
          /* MODE 2 (after request): generic confirmation */
          <>
            <h1 style={heading}>Check your email.</h1>
            <p style={body}>If that email is registered, a reset link is on its way. It expires in 2 hours.</p>
            <p style={{ ...body, color: "#888", fontSize: "0.78rem" }}>Running locally? The link is printed in the Django server console.</p>
            <Link href="/signin" style={primaryButton}>Back to sign in</Link>
          </>
        ) : (
          /* MODE 2: request a reset link */
          <>
            <h1 style={heading}>Forgot it?</h1>
            <p style={body}>Enter your email and we&apos;ll send a link to set a new password.</p>
            <form onSubmit={handleRequest} noValidate>
              <label style={label} htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={input} />
              {error && <p role="alert" style={errorText}>{error}</p>}
              <button type="submit" disabled={!email.trim() || submitting} style={{ ...primaryButton, opacity: !email.trim() || submitting ? 0.4 : 1, marginTop: 28 }}>
                {submitting ? "Sending…" : "Send reset link →"}
              </button>
            </form>
            <Link href="/signin" style={{ ...label, marginTop: 20, display: "inline-block", textDecoration: "underline", color: "#111" }}>Back to sign in</Link>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #eee", padding: "12px 24px" }}>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#ccc" }}>MOCK_MVP_PAPER_TRADING_ONLY</span>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100svh", background: "#fff" }} />}>
      <ResetPasswordInner />
    </Suspense>
  );
}

const heading: React.CSSProperties = { fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(2rem,8vw,3rem)", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 18px" };
const body: React.CSSProperties = { fontFamily: "var(--font-archivo), sans-serif", fontSize: "0.95rem", lineHeight: 1.6, color: "#444", margin: "0 0 16px", maxWidth: 420 };
const label: React.CSSProperties = { display: "block", fontFamily: "var(--font-mono), monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#888", marginBottom: 8 };
const input: React.CSSProperties = { width: "100%", border: "none", borderBottom: "2px solid #111", background: "transparent", color: "#111", padding: "10px 0", fontFamily: "var(--font-archivo), sans-serif", fontSize: "1.05rem", outline: "none" };
const errorText: React.CSSProperties = { fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", color: "#b42318", margin: "16px 0 0", lineHeight: 1.5 };
const primaryButton: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 32px", border: "1px solid #111", background: "#111", color: "#fff", fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", minHeight: 48, width: "100%", textDecoration: "none" };
