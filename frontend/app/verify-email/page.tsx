"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

type Phase = "verifying" | "success" | "error" | "no-token";

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const supaMode = isSupabaseConfigured();
  // Supabase confirmation links redirect to /onboarding and are handled by the auth
  // listener, so the token-verify path is Django-only. In Supabase/local mode this
  // page is only a calm "check your email" notice.
  const usesToken = !!token && !supaMode;
  const [phase, setPhase] = useState<Phase>(usesToken ? "verifying" : "no-token");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (!usesToken || ran.current) return;
    ran.current = true; // guard React StrictMode double-invoke (token is one-time-use)
    (async () => {
      try {
        const res = await apiClient.verifyEmail(token as string);
        setMessage(res.message);
        setPhase("success");
        setTimeout(() => router.replace("/login"), 1800);
      } catch (err) {
        setMessage(err instanceof ApiError ? err.message : "Verification failed.");
        setPhase("error");
      }
    })();
  }, [usesToken, token, router]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || resending || !supaMode || !supabase) return;
    setResendMessage(null);
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: {
          emailRedirectTo: SITE_URL ? `${SITE_URL}/onboarding` : undefined,
        },
      });
      if (error) throw error;
      setResendMessage("If that account is still waiting for confirmation, a fresh link is on its way.");
    } catch {
      setResendMessage("We could not send a fresh link right now. Check the email and try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main style={{ minHeight: "100svh", background: "#fff", color: "#111", display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <div style={{ height: 2, background: "#111" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "18px 24px 0" }}>
        <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Young Investors</span>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "#aaa" }}>We Cook.</span>
      </div>

      <div style={{ padding: "clamp(28px,8vw,64px) 24px", maxWidth: 480 }}>
        <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.15em", color: phase === "error" ? "#b42318" : "#888", margin: "0 0 10px" }}>
          Email verification
        </p>

        {phase === "verifying" && (
          <h1 style={headingStyle}>Verifying your email…</h1>
        )}

        {phase === "success" && (
          <>
            <h1 style={headingStyle}>You&apos;re in.</h1>
            <p style={bodyStyle}>{message} Taking you to sign in…</p>
            <Link href="/login" style={buttonStyle}>Sign in now</Link>
          </>
        )}

        {phase === "error" && (
          <>
            <h1 style={headingStyle}>Link didn&apos;t work.</h1>
            <p style={{ ...bodyStyle, color: "#b42318" }}>{message}</p>
            <p style={bodyStyle}>Verification links expire after 24 hours and can only be used once. Sign up again or sign in if you&apos;ve already verified.</p>
            <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/login" style={buttonStyle}>Sign in</Link>
              <Link href="/login" style={{ ...buttonStyle, background: "#fff", color: "#111" }}>Start over</Link>
            </div>
          </>
        )}

        {phase === "no-token" && (
          <>
            <h1 style={headingStyle}>Check your email.</h1>
            <p style={bodyStyle}>
              We sent a confirmation link to your inbox. Click it to finish your Chef profile.
            </p>
            {supaMode && (
              <form onSubmit={handleResend} noValidate style={{ margin: "20px 0 4px", maxWidth: 420 }}>
                <label style={labelStyle} htmlFor="verify-email-resend">Need a fresh link?</label>
                <input
                  id="verify-email-resend"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
                <button
                  type="submit"
                  disabled={!email.trim() || resending}
                  style={{ ...buttonStyle, width: "100%", opacity: !email.trim() || resending ? 0.4 : 1 }}
                >
                  {resending ? "Sending..." : "Resend verification"}
                </button>
                {resendMessage && <p role="status" style={{ ...bodyStyle, color: "#555", fontSize: "0.78rem", marginTop: 12 }}>{resendMessage}</p>}
              </form>
            )}
            {!supaMode && (
              <p style={{ ...bodyStyle, color: "#888", fontSize: "0.78rem" }}>
                Running locally? The link is saved in the Django local email outbox.
              </p>
            )}
            <Link href="/login" style={buttonStyle}>Back to sign in</Link>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #eee", padding: "12px 24px" }}>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#ccc" }}>
          MOCK_MVP_PAPER_TRADING_ONLY
        </span>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100svh", background: "#fff" }} />}>
      <VerifyEmailInner />
    </Suspense>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-bodoni), Georgia, serif",
  fontSize: "clamp(2rem,8vw,3rem)",
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: "-0.02em",
  margin: "0 0 18px",
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-archivo), sans-serif",
  fontSize: "0.95rem",
  lineHeight: 1.6,
  color: "#444",
  margin: "0 0 14px",
  maxWidth: 420,
};

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
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "13px 28px",
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  textDecoration: "none",
  marginTop: 12,
};
