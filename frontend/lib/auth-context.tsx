"use client";

/**
 * Shared authentication context for the Young Investors tester build.
 *
 * One source of truth for the signed-in Chef, provided at the root layout so every
 * page and component sees the same state. Two interchangeable backends:
 *   - Supabase configured     → Supabase Auth + the `profiles` table (the tester stack).
 *   - Supabase NOT configured → a localStorage "local demo" so the app still runs.
 *
 * The public `useAuth()` surface is stable, so onboarding, sign-in, AppShell, and
 * TopBar consume it unchanged. The Django client (lib/api-client.ts) is preserved for
 * future production but is no longer on the active path.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — no real-money, broker, or bank endpoints exist.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, type LoginPayload, type SignupPayload, type UpdateProfilePayload } from "./api-client";
import { isProductionMisconfigured, isSupabaseConfigured, requireSupabase } from "./supabaseClient";
import {
  type AttemptResult,
  type ChefProfile,
  type KitchenVoteInput,
  type PredictionInput,
  activateLocalSession,
  clearLocalSession,
  logKitchenVote,
  logPrediction,
  makeLocalProfile,
  readLocalProfile,
  readLocalSessionProfile,
  saveProfile,
  sbGetOrCreateProfile,
  submitAcademyAttempt,
  writeLocalProfile,
} from "./profileStore";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

interface SignupResult {
  needsEmailConfirm: boolean;
  user: ChefProfile | null;
}

interface AuthContextValue {
  user: ChefProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True when running the localStorage demo (no Supabase configured). */
  isLocalMode: boolean;
  signup: (payload: SignupPayload) => Promise<SignupResult>;
  login: (payload: LoginPayload) => Promise<ChefProfile>;
  /** OAuth sign-in/sign-up with Google (live app only). Redirects the browser. */
  signInWithGoogle: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<ChefProfile>;
  refreshUser: () => Promise<void>;
  /** Run one Academy practice attempt (capped at three). */
  submitAttempt: () => Promise<{ profile: ChefProfile; attempt: AttemptResult }>;
  /** Best-effort Kitchen vote log; updates the demo kitchen score. */
  recordKitchenVote: (input: KitchenVoteInput) => Promise<void>;
  /** Best-effort market prediction log; updates the demo prediction scores. */
  recordPrediction: (input: PredictionInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Translate a Supabase AuthError into the ApiError the forms already understand. */
function toApiError(error: { message?: string; status?: number } | null): ApiError {
  const msg = error?.message || "Authentication failed. Try again.";
  const lower = msg.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return new ApiError(400, "That email is already registered. Try signing in.", {
      email: "Already registered.",
    });
  }
  if (lower.includes("not confirmed") || lower.includes("confirm your email")) {
    return new ApiError(403, "Confirm your email before your first cook.", {}, "email_unverified");
  }
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return new ApiError(401, "Email or password is incorrect.");
  }
  if (lower.includes("password")) {
    return new ApiError(400, msg, { password: msg });
  }
  return new ApiError(error?.status ?? 400, msg);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ChefProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLocalMode = !isSupabaseConfigured();

  // Fail closed (SECURITY_GUARDRAILS §1): if a deployed production build is missing
  // Supabase config, refuse to serve the local-demo auth. Evaluated on the client
  // (post-mount) so SSR/prerender is unaffected and no hydration mismatch occurs.
  const [misconfigured, setMisconfigured] = useState(false);
  useEffect(() => {
    setMisconfigured(isProductionMisconfigured());
  }, []);

  // Restore session on first mount, and (Supabase) follow auth changes such as an
  // email-confirmation redirect completing in another tab.
  useEffect(() => {
    let cancelled = false;

    if (!isSupabaseConfigured()) {
      const p = readLocalSessionProfile();
      if (!cancelled) {
        setUser(p);
        setIsLoading(false);
      }
      return () => {
        cancelled = true;
      };
    }

    const sb = requireSupabase();
    (async () => {
      try {
        const { data } = await sb.auth.getSession();
        if (data.session && !cancelled) {
          const p = await sbGetOrCreateProfile();
          if (!cancelled) setUser(p);
        }
      } catch {
        /* transient — stay logged out rather than crash */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    const { data: sub } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      if (!session) {
        setUser(null);
        return;
      }
      try {
        const p = await sbGetOrCreateProfile();
        if (!cancelled) setUser(p);
      } catch {
        /* ignore — next refresh will retry */
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signup = useCallback(async (payload: SignupPayload): Promise<SignupResult> => {
    const seed = {
      email: payload.email,
      chef_alias: payload.chef_alias,
      age: payload.age ?? null,
      intent: payload.intent ?? "",
      profile_icon: payload.profile_icon ?? "chef-default",
    };

    if (!isSupabaseConfigured()) {
      const profile = makeLocalProfile(seed);
      writeLocalProfile(profile);
      activateLocalSession();
      setUser(profile);
      return { needsEmailConfirm: false, user: profile };
    }

    const sb = requireSupabase();
    const { data, error } = await sb.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          chef_alias: seed.chef_alias,
          age: seed.age,
          intent: seed.intent,
          profile_icon: seed.profile_icon,
        },
        emailRedirectTo: SITE_URL ? `${SITE_URL}/kitchen` : undefined,
      },
    });
    if (error) throw toApiError(error);

    // Session present → email confirmation is disabled, tester is in immediately.
    if (data.session) {
      const profile = await sbGetOrCreateProfile(seed);
      setUser(profile);
      return { needsEmailConfirm: false, user: profile };
    }
    // No session → confirmation email sent; profile row is created on first login.
    return { needsEmailConfirm: true, user: null };
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<ChefProfile> => {
    if (!isSupabaseConfigured()) {
      const profile = readLocalProfile();
      if (!profile) {
        throw new ApiError(404, "No local demo Chef yet. Start your journey to create one.");
      }
      activateLocalSession();
      setUser(profile);
      return profile;
    }

    const sb = requireSupabase();
    const { error } = await sb.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (error) throw toApiError(error);
    const profile = await sbGetOrCreateProfile();
    if (!profile) throw new ApiError(500, "Signed in, but your profile didn't load. Refresh and retry.");
    setUser(profile);
    return profile;
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      throw new ApiError(400, "Google sign-in is only available on the live app.");
    }
    const sb = requireSupabase();
    // Use the current origin so OAuth returns to whatever host the Chef started on.
    // Must be allow-listed in Supabase Auth → URL Configuration.
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/kitchen`
        : SITE_URL
          ? `${SITE_URL}/kitchen`
          : undefined;
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw toApiError(error);
    // The browser is now redirecting to Google; onAuthStateChange finishes on return.
  }, []);

  const resendVerification = useCallback(async (email: string): Promise<void> => {
    const cleanEmail = email.trim();
    if (!cleanEmail) throw new ApiError(400, "Enter your email first.");

    if (!isSupabaseConfigured()) {
      return;
    }

    const sb = requireSupabase();
    const { error } = await sb.auth.resend({
      type: "signup",
      email: cleanEmail,
      options: {
        emailRedirectTo: SITE_URL ? `${SITE_URL}/kitchen` : undefined,
      },
    });
    if (error) throw toApiError(error);
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      try {
        await requireSupabase().auth.signOut();
      } catch {
        /* ignore */
      }
    } else {
      clearLocalSession();
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<ChefProfile> => {
      if (!user) throw new ApiError(401, "You're not signed in.");
      const profile = await saveProfile(
        user,
        {
          chef_alias: payload.chef_alias,
          age: payload.age,
          intent: payload.intent,
          profile_icon: payload.profile_icon,
        },
        payload.profile_picture ?? null
      );
      setUser(profile);
      return profile;
    },
    [user]
  );

  const refreshUser = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const p = await sbGetOrCreateProfile();
      if (p) setUser(p);
    } else {
      setUser(readLocalSessionProfile());
    }
  }, []);

  const submitAttempt = useCallback(async () => {
    if (!user) throw new ApiError(401, "You're not signed in.");
    const res = await submitAcademyAttempt(user);
    setUser(res.profile);
    return res;
  }, [user]);

  const recordKitchenVote = useCallback(
    async (input: KitchenVoteInput) => {
      const updated = await logKitchenVote(input, user);
      if (updated) setUser(updated);
    },
    [user]
  );

  const recordPrediction = useCallback(
    async (input: PredictionInput) => {
      const updated = await logPrediction(input, user);
      if (updated) setUser(updated);
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isLocalMode,
      signup,
      login,
      signInWithGoogle,
      resendVerification,
      logout,
      updateProfile,
      refreshUser,
      submitAttempt,
      recordKitchenVote,
      recordPrediction,
    }),
    [
      user,
      isLoading,
      isLocalMode,
      signup,
      login,
      signInWithGoogle,
      resendVerification,
      logout,
      updateProfile,
      refreshUser,
      submitAttempt,
      recordKitchenVote,
      recordPrediction,
    ]
  );

  if (misconfigured) {
    return (
      <main
        style={{
          minHeight: "100svh",
          background: "#fff",
          color: "#111",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
          gap: 12,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "#b42318" }}>
          Configuration required
        </span>
        <h1 style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: "clamp(1.4rem,6vw,2rem)", fontWeight: 700, margin: 0, maxWidth: 460, lineHeight: 1.15 }}>
          The Kitchen isn&apos;t configured yet.
        </h1>
        <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", color: "#555", maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
          This deployment is missing its Supabase connection. For your safety, sign-in is
          disabled until it&apos;s set up. Please check back shortly.
        </p>
      </main>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>. Wrap the app in layout.tsx.");
  }
  return ctx;
}
