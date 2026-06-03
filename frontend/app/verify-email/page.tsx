"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";

type Phase = "verifying" | "success" | "error" | "no-token";

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [phase, setPhase] = useState<Phase>(token ? "verifying" : "no-token");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true; // guard React StrictMode double-invoke (token is one-time-use)
    (async () => {
      try {
        const res = await apiClient.verifyEmail(token);
        setMessage(res.message);
        setPhase("success");
        setTimeout(() => router.replace("/signin"), 1800);
      } catch (err) {
        setMessage(err instanceof ApiError ? err.message : "Verification failed.");
        setPhase("error");
      }
    })();
  }, [token, router]);

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
            <Link href="/signin" style={buttonStyle}>Sign in now →</Link>
          </>
        )}

        {phase === "error" && (
          <>
            <h1 style={headingStyle}>Link didn&apos;t work.</h1>
            <p style={{ ...bodyStyle, color: "#b42318" }}>{message}</p>
            <p style={bodyStyle}>Verification links expire after 24 hours and can only be used once. Sign up again or sign in if you&apos;ve already verified.</p>
            <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/signin" style={buttonStyle}>Sign in</Link>
              <Link href="/onboarding" style={{ ...buttonStyle, background: "#fff", color: "#111" }}>Start over</Link>
            </div>
          </>
        )}

        {phase === "no-token" && (
          <>
            <h1 style={headingStyle}>Check your email.</h1>
            <p style={bodyStyle}>
              We sent a verification link to your inbox. Click it to open the Kitchen. The link expires in 24 hours.
            </p>
            <p style={{ ...bodyStyle, color: "#888", fontSize: "0.78rem" }}>
              Running locally? The link is printed in the Django server console.
            </p>
            <Link href="/signin" style={buttonStyle}>Back to sign in</Link>
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
