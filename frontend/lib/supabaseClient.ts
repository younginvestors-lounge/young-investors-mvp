/**
 * Browser-safe Supabase client for the Young Investors tester build.
 *
 * Reads the public URL + anon key from the environment. The anon key is the ONLY
 * Supabase key that may live in client code — never the service_role key.
 *
 * If the env vars are absent (e.g. a fresh local checkout with no Supabase project),
 * `supabase` is `null` and `isSupabaseConfigured()` returns false. The app then runs
 * in local demo mode instead of crashing — see lib/auth-context.tsx.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — no real-money, broker, or bank endpoints exist.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

/** True only when both public env vars are present, so callers can branch safely. */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

/**
 * Fail-closed guard (SECURITY_GUARDRAILS §1): a DEPLOYED production build with no
 * Supabase config must NOT silently serve the local-demo (localStorage) auth — that
 * would ship fake auth to a public domain. The graceful local-demo fallback stays
 * allowed only for local development / localhost. Returns false during SSR so it
 * never blocks prerender (the check re-runs on the client).
 */
export function isProductionMisconfigured(): boolean {
  if (isSupabaseConfigured()) return false;
  if (process.env.NODE_ENV !== "production") return false;
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".local");
  return !isLocal;
}

/**
 * The shared browser client, or `null` when Supabase is not configured.
 * Created once at module load. `detectSessionInUrl` lets Supabase finish an
 * email-confirmation / magic-link redirect; `persistSession` keeps testers
 * signed in across reloads.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "yi_supabase_auth",
      },
    })
  : null;

/** Narrowing helper: returns the client or throws a clear error if misconfigured. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}
