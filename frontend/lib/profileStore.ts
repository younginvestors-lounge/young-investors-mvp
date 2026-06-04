/**
 * Profile + progress data layer for the Young Investors tester build.
 *
 * One module, two backends:
 *   - Supabase configured  → reads/writes the `profiles` table + related tables.
 *   - Supabase NOT configured → a localStorage "local demo" so the app still runs.
 *
 * Everything is mapped into a single `ChefProfile` shape (a superset of the Django
 * `ChefUser`) so the existing UI — TopBar, AppShell, etc. — needs no rewrites.
 *
 * Chef numbering: seats 0 and 1 are reserved for Gordon and Sicilia (the AI
 * characters). Real testers are numbered from 2 upward, allocated race-safely by a
 * Postgres sequence (see supabase/schema.sql). Capacity target is 101 testers — no
 * signup cap is enforced here, so well over 30 testers can play.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — no real-money, broker, or bank endpoints exist.
 */

import { isSupabaseConfigured, requireSupabase } from "./supabaseClient";
import { rememberGordonChefReason } from "./gordonKnowledgeBank";

/* ── Reserved seats + capacity ── */

/** The two AI characters occupy Chef No. 0 and No. 1. Testers start at 2. */
export const RESERVED_CHEFS = {
  gordon: { number: 0, name: "Gordon" },
  sicilia: { number: 1, name: "Sicilia" },
} as const;

export const FIRST_TESTER_NUMBER = 2;
/** Design capacity for the public test (Gordon 0, Sicilia 1, testers 2–101). */
export const MAX_TESTER_NUMBER = 101;

export const ATTEMPT_LIMIT = 3;
export const PASS_THRESHOLD = 60;

/* ── Types ── */

/** The unified profile the UI consumes. Superset of the Django ChefUser shape. */
export interface ChefProfile {
  id: string;
  username: string;
  email: string;
  chef_alias: string;
  age: number | null;
  intent: string;
  email_verified: boolean;
  is_training_mode: boolean;
  member_number: number | null;
  profile_icon: string;
  profile_picture: string | null;
  // Extended tester scores
  mode: string;
  rank: string;
  academy_score: number;
  jse_market_score: number;
  risk_return_score: number;
  kitchen_score: number;
  personal_prediction_score: number;
  kitchen_prediction_score: number;
  credential_status: string;
  attempts_used: number;
  current_kitchen: string;
}

export interface ProfileSeed {
  email: string;
  chef_alias: string;
  age: number | null;
  intent: string;
  profile_icon: string;
}

export interface AttemptResult {
  score: number;
  bestScore: number;
  attemptsUsed: number;
  attemptsLeft: number;
  status: string;
  cleared: boolean;
}

export interface KitchenVoteInput {
  kitchenName: string;
  proposalTicker: string;
  vote: string;
  seasoningReason?: string;
}

export interface PredictionInput {
  ticker: string;
  personalPrediction: string;
  kitchenPrediction?: string;
}

/** Raw shape of a `profiles` row (loosely typed; columns may be null pre-default). */
interface ProfileRow {
  id: string;
  chef_alias: string | null;
  age: number | null;
  intent: string | null;
  profile_icon: string | null;
  profile_picture_url: string | null;
  member_number: number | null;
  mode: string | null;
  rank: string | null;
  academy_score: number | null;
  jse_market_score: number | null;
  risk_return_score: number | null;
  kitchen_score: number | null;
  personal_prediction_score: number | null;
  kitchen_prediction_score: number | null;
  credential_status: string | null;
  attempts_used: number | null;
  current_kitchen: string | null;
}

/** Thrown when a tester tries a 4th Academy attempt. */
export class AttemptLimitError extends Error {
  constructor() {
    super("You've used all three attempts. Mastery is correction — review and come back stronger.");
    this.name = "AttemptLimitError";
  }
}

/* ── Pure helpers ── */

/** Kitchen-brigade rank from a best Academy score. A calm status ladder for the Lounge. */
export function computeRank(score: number): string {
  if (score >= 95) return "Head Chef";
  if (score >= 80) return "Sous Chef";
  if (score >= PASS_THRESHOLD) return "Chef de Partie";
  if (score >= 40) return "Demi Chef";
  return "Commis";
}

function deriveCredential(bestScore: number, attemptsUsed: number): string {
  if (bestScore >= PASS_THRESHOLD) return "cleared";
  if (attemptsUsed > 0) return "in_progress";
  return "not_started";
}

/** Simulated practice score — biased to feel earned, most clear within three tries. */
function simulateAttemptScore(): number {
  return Math.round(45 + Math.random() * 54); // 45–99
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function validateImage(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file isn't an image. Use a JPG, PNG, or WEBP.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image is over 5MB. Pick a smaller one.");
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that image."));
    reader.readAsDataURL(file);
  });
}

/* ── Local demo mode (no Supabase) ── */

const LOCAL_KEY = "yi_local_profile";
const LOCAL_SESSION_KEY = "yi_local_session_active";

export function readLocalProfile(): ChefProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as ChefProfile) : null;
  } catch {
    return null;
  }
}

export function readLocalSessionProfile(): ChefProfile | null {
  if (typeof window === "undefined") return null;
  try {
    if (localStorage.getItem(LOCAL_SESSION_KEY) !== "1") return null;
    return readLocalProfile();
  } catch {
    return null;
  }
}

export function writeLocalProfile(profile: ChefProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
  } catch {
    /* quota or privacy mode — non-fatal in demo */
  }
}

export function activateLocalSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_SESSION_KEY, "1");
  } catch {
    /* non-fatal */
  }
}

export function clearLocalSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {
    /* non-fatal */
  }
}

export function clearLocalProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    /* non-fatal */
  }
}

/** Build a fresh local-demo profile. First (and only) local tester takes seat #2. */
export function makeLocalProfile(seed: ProfileSeed): ChefProfile {
  const age = seed.age;
  return {
    id: `local-${Date.now()}`,
    username: seed.email,
    email: seed.email,
    chef_alias: seed.chef_alias || "Chef",
    age,
    intent: seed.intent || "",
    email_verified: true,
    is_training_mode: age != null && age < 18,
    member_number: FIRST_TESTER_NUMBER,
    profile_icon: seed.profile_icon || "chef-default",
    profile_picture: null,
    mode: age != null && age < 18 ? "training" : "full_simulation",
    rank: "Commis",
    academy_score: 0,
    jse_market_score: 0,
    risk_return_score: 0,
    kitchen_score: 0,
    personal_prediction_score: 0,
    kitchen_prediction_score: 0,
    credential_status: "not_started",
    attempts_used: 0,
    current_kitchen: "Rhodes Alpha Kitchen",
  };
}

/* ── Supabase mapping ── */

interface AuthIdentity {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

function rowToProfile(auth: AuthIdentity, row: ProfileRow): ChefProfile {
  const age = row.age ?? null;
  return {
    id: auth.id,
    username: auth.email ?? "",
    email: auth.email ?? "",
    chef_alias: row.chef_alias ?? "Chef",
    age,
    intent: row.intent ?? "",
    email_verified: true,
    is_training_mode: age != null && age < 18,
    member_number: row.member_number ?? null,
    profile_icon: row.profile_icon ?? "chef-default",
    profile_picture: row.profile_picture_url ?? null,
    mode: row.mode ?? "full_simulation",
    rank: row.rank ?? "Commis",
    academy_score: row.academy_score ?? 0,
    jse_market_score: row.jse_market_score ?? 0,
    risk_return_score: row.risk_return_score ?? 0,
    kitchen_score: row.kitchen_score ?? 0,
    personal_prediction_score: row.personal_prediction_score ?? 0,
    kitchen_prediction_score: row.kitchen_prediction_score ?? 0,
    credential_status: row.credential_status ?? "not_started",
    attempts_used: row.attempts_used ?? 0,
    current_kitchen: row.current_kitchen ?? "Rhodes Alpha Kitchen",
  };
}

/* ── Supabase operations ── */

/** Current auth identity, or null if no session. */
async function sbAuthUser(): Promise<AuthIdentity | null> {
  const sb = requireSupabase();
  const { data } = await sb.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email, user_metadata: data.user.user_metadata } : null;
}

/**
 * Fetch the signed-in tester's profile, creating the row on first sight. The
 * member_number is assigned by a DB trigger (sequence from 2), so we never send it.
 */
export async function sbGetOrCreateProfile(seed?: Partial<ProfileSeed>): Promise<ChefProfile | null> {
  const sb = requireSupabase();
  const auth = await sbAuthUser();
  if (!auth) return null;

  const { data: existing, error: selErr } = await sb
    .from("profiles")
    .select("*")
    .eq("id", auth.id)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return rowToProfile(auth, existing as ProfileRow);

  const meta = auth.user_metadata ?? {};
  const age = (seed?.age ?? (meta.age as number | undefined)) ?? null;
  const insert = {
    id: auth.id,
    chef_alias: seed?.chef_alias ?? (meta.chef_alias as string) ?? "Chef",
    age,
    intent: seed?.intent ?? (meta.intent as string) ?? "",
    profile_icon: seed?.profile_icon ?? (meta.profile_icon as string) ?? "chef-default",
    mode: age != null && age < 18 ? "training" : "full_simulation",
  };
  const { data: created, error: insErr } = await sb
    .from("profiles")
    .insert(insert)
    .select("*")
    .single();
  if (insErr) throw insErr;
  return rowToProfile(auth, created as ProfileRow);
}

type WritableFields = Partial<{
  chef_alias: string;
  age: number | null;
  intent: string;
  profile_icon: string;
  profile_picture_url: string;
  current_kitchen: string;
  mode: string;
}>;

async function sbUpdateFields(fields: WritableFields): Promise<ChefProfile> {
  const sb = requireSupabase();
  const auth = await sbAuthUser();
  if (!auth) throw new Error("No authenticated tester.");
  const { data, error } = await sb
    .from("profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", auth.id)
    .select("*")
    .single();
  if (error) throw error;
  return rowToProfile(auth, data as ProfileRow);
}

/** Upload an avatar to Storage and return its public URL (no DB write here). */
async function sbUploadAvatar(file: File): Promise<string> {
  const sb = requireSupabase();
  const auth = await sbAuthUser();
  if (!auth) throw new Error("No authenticated tester.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${auth.id}/avatar-${Date.now()}.${ext}`;
  const { error: upErr } = await sb.storage
    .from("profile-pictures")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data } = sb.storage.from("profile-pictures").getPublicUrl(path);
  return data.publicUrl;
}

/* ── Public, mode-agnostic operations used by auth-context + feature components ── */

/** Persist edited profile fields (+ optional new avatar). Branches on backend. */
export async function saveProfile(
  base: ChefProfile,
  fields: { chef_alias?: string; age?: number | null; intent?: string; profile_icon?: string },
  picture?: File | null
): Promise<ChefProfile> {
  let pictureUrl: string | undefined;
  if (picture) {
    validateImage(picture);
    pictureUrl = isSupabaseConfigured() ? await sbUploadAvatar(picture) : await fileToDataUrl(picture);
  }

  if (isSupabaseConfigured()) {
    return sbUpdateFields({
      ...fields,
      ...(pictureUrl ? { profile_picture_url: pictureUrl } : {}),
    });
  }

  // Local mode
  const updated: ChefProfile = {
    ...base,
    ...("chef_alias" in fields && fields.chef_alias !== undefined ? { chef_alias: fields.chef_alias } : {}),
    ...("age" in fields && fields.age !== undefined ? { age: fields.age } : {}),
    ...("intent" in fields && fields.intent !== undefined ? { intent: fields.intent } : {}),
    ...("profile_icon" in fields && fields.profile_icon !== undefined ? { profile_icon: fields.profile_icon } : {}),
    ...(pictureUrl ? { profile_picture: pictureUrl } : {}),
  };
  writeLocalProfile(updated);
  return updated;
}

/**
 * Run one Academy practice attempt. Caps at three, stores the attempt log, and
 * lifts academy_score (best), attempts_used, credential_status, and rank.
 */
export async function submitAcademyAttempt(current: ChefProfile): Promise<{ profile: ChefProfile; attempt: AttemptResult }> {
  if (current.attempts_used >= ATTEMPT_LIMIT) throw new AttemptLimitError();

  const score = simulateAttemptScore();
  const bestScore = Math.max(current.academy_score, score);
  const attemptsUsed = current.attempts_used + 1;
  const status = deriveCredential(bestScore, attemptsUsed);
  const rank = computeRank(bestScore);

  const attempt: AttemptResult = {
    score,
    bestScore,
    attemptsUsed,
    attemptsLeft: ATTEMPT_LIMIT - attemptsUsed,
    status,
    cleared: bestScore >= PASS_THRESHOLD,
  };

  if (isSupabaseConfigured()) {
    const sb = requireSupabase();
    const auth = await sbAuthUser();
    if (!auth) throw new Error("No authenticated tester.");
    // Best-effort attempt log; the profile update below is the source of truth.
    await sb
      .from("academy_attempts")
      .insert({ user_id: auth.id, attempt_number: attemptsUsed, score, best_score: bestScore, status })
      .then(undefined, () => undefined);
    const { data, error } = await sb
      .from("profiles")
      .update({
        academy_score: bestScore,
        attempts_used: attemptsUsed,
        credential_status: status,
        rank,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.id)
      .select("*")
      .single();
    if (error) throw error;
    return { profile: rowToProfile(auth, data as ProfileRow), attempt };
  }

  // Local mode
  const profile: ChefProfile = {
    ...current,
    academy_score: bestScore,
    attempts_used: attemptsUsed,
    credential_status: status,
    rank,
  };
  writeLocalProfile(profile);
  return { profile, attempt };
}

/**
 * Best-effort: log a Kitchen vote and nudge the demo kitchen_score. Never throws —
 * a logging hiccup must not break the vote in the UI.
 */
export async function logKitchenVote(input: KitchenVoteInput, current: ChefProfile | null): Promise<ChefProfile | null> {
  if (!current) return current;
  const kitchen_score = clampScore(current.kitchen_score + 6);
  if (input.seasoningReason) {
    rememberGordonChefReason(current.id, {
      source: "kitchen",
      action: "recipe-vote",
      ticker: input.proposalTicker,
      vote: input.vote,
      reason: input.seasoningReason,
    });
  }
  try {
    if (isSupabaseConfigured()) {
      const sb = requireSupabase();
      const auth = await sbAuthUser();
      if (!auth) return current;
      await sb.from("kitchen_votes").insert({
        user_id: auth.id,
        kitchen_name: input.kitchenName,
        proposal_ticker: input.proposalTicker,
        vote: input.vote,
        seasoning_reason: input.seasoningReason ?? null,
      });
      await sb.from("profiles").update({ kitchen_score, updated_at: new Date().toISOString() }).eq("id", auth.id);
    } else {
      writeLocalProfile({ ...current, kitchen_score });
    }
  } catch {
    return current; // best-effort
  }
  return { ...current, kitchen_score };
}

/**
 * Best-effort: log a market prediction and nudge the demo prediction scores.
 */
export async function logPrediction(input: PredictionInput, current: ChefProfile | null): Promise<ChefProfile | null> {
  if (!current) return current;
  const personal_prediction_score = clampScore(current.personal_prediction_score + 8);
  const kitchen_prediction_score = input.kitchenPrediction
    ? clampScore(current.kitchen_prediction_score + 8)
    : current.kitchen_prediction_score;
  try {
    if (isSupabaseConfigured()) {
      const sb = requireSupabase();
      const auth = await sbAuthUser();
      if (!auth) return current;
      await sb.from("prediction_logs").insert({
        user_id: auth.id,
        ticker: input.ticker,
        personal_prediction: input.personalPrediction,
        kitchen_prediction: input.kitchenPrediction ?? null,
      });
      await sb
        .from("profiles")
        .update({ personal_prediction_score, kitchen_prediction_score, updated_at: new Date().toISOString() })
        .eq("id", auth.id);
    } else {
      writeLocalProfile({ ...current, personal_prediction_score, kitchen_prediction_score });
    }
  } catch {
    return current;
  }
  return { ...current, personal_prediction_score, kitchen_prediction_score };
}

/** Anonymous tester feedback. Best-effort; safe to call without a session. */
export async function submitFeedback(input: { screen: string; rating?: number; text?: string }): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = requireSupabase();
    const auth = await sbAuthUser();
    await sb.from("tester_feedback").insert({
      user_id: auth?.id ?? null,
      screen: input.screen,
      rating: input.rating ?? null,
      text: input.text ?? null,
    });
  } catch {
    /* best-effort */
  }
}

/* ── Kitchens — form a real Kitchen (2 chefs is enough) ───────────────────── */

export type Governance = "mutual" | "hedge";

/** Minimum chefs for a Kitchen to start cooking (voting). */
export const MIN_KITCHEN_CHEFS = 2;

export interface KitchenMemberLite {
  userId: string;
  alias: string;
  icon: string;
  memberNumber: number | null;
  role: string; // 'founder' | 'chef'
  isYou: boolean;
  /** A local-demo practice co-chef (never on the real Supabase deploy). */
  simulated?: boolean;
}

export interface KitchenState {
  id: string;
  name: string;
  governance: Governance;
  joinCode: string;
  members: KitchenMemberLite[];
}

const LOCAL_KITCHEN_KEY = "yi_local_kitchen";
const SIM_CHEF_NAMES = ["Lwazi", "Thando", "Amara", "Kgosi", "Naledi", "Sipho"];
const SIM_ICONS = ["flame", "growth", "shield", "star", "pot", "chart"];

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function youMember(p: ChefProfile): KitchenMemberLite {
  return {
    userId: p.id,
    alias: p.chef_alias || "Chef",
    icon: p.profile_icon || "chef-default",
    memberNumber: p.member_number,
    role: "founder",
    isYou: true,
  };
}

function readLocalKitchen(): KitchenState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KITCHEN_KEY);
    return raw ? (JSON.parse(raw) as KitchenState) : null;
  } catch {
    return null;
  }
}

function writeLocalKitchen(k: KitchenState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KITCHEN_KEY, JSON.stringify(k));
  } catch {
    /* non-fatal */
  }
}

/** Assemble the caller's Kitchen from the my_kitchen() RPC rows. */
async function sbGetMyKitchen(): Promise<KitchenState | null> {
  const sb = requireSupabase();
  const auth = await sbAuthUser();
  if (!auth) return null;
  const { data, error } = await sb.rpc("my_kitchen");
  if (error) throw error;
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  if (rows.length === 0) return null;
  const first = rows[0];
  const members: KitchenMemberLite[] = rows.map((r) => ({
    userId: String(r.member_user),
    alias: (r.member_alias as string) ?? "Chef",
    icon: (r.member_icon as string) ?? "chef-default",
    memberNumber: (r.member_number as number) ?? null,
    role: (r.member_role as string) ?? "chef",
    isYou: auth.id === String(r.member_user),
  }));
  return {
    id: String(first.kitchen_id),
    name: (first.name as string) ?? "Kitchen",
    governance: ((first.governance as string) === "hedge" ? "hedge" : "mutual"),
    joinCode: (first.join_code as string) ?? "",
    members,
  };
}

/** The caller's current Kitchen, or null if they haven't formed/joined one. */
export async function getMyKitchen(current: ChefProfile | null): Promise<KitchenState | null> {
  if (isSupabaseConfigured()) return sbGetMyKitchen();
  const k = readLocalKitchen();
  if (!k || !current) return k;
  // Keep the "you" member in sync with the live local profile.
  return { ...k, members: k.members.map((m) => (m.isYou ? { ...youMember(current), role: m.role } : m)) };
}

/** Create a Kitchen with the caller as founder. */
export async function createKitchen(name: string, governance: Governance, current: ChefProfile): Promise<KitchenState> {
  if (isSupabaseConfigured()) {
    const sb = requireSupabase();
    const { error } = await sb.rpc("create_kitchen", { p_name: name, p_governance: governance });
    if (error) throw error;
    const k = await sbGetMyKitchen();
    if (!k) throw new Error("Kitchen created but didn't load. Refresh and retry.");
    return k;
  }
  const kitchen: KitchenState = {
    id: `local-k-${Date.now()}`,
    name: name.trim() || "New Kitchen",
    governance,
    joinCode: randomCode(),
    members: [youMember(current)],
  };
  writeLocalKitchen(kitchen);
  writeLocalProfile({ ...current, current_kitchen: kitchen.name });
  return kitchen;
}

/** Join a Kitchen by its share code. */
export async function joinKitchenByCode(code: string, current: ChefProfile): Promise<KitchenState> {
  const clean = code.trim().toUpperCase();
  if (!clean) throw new Error("Enter a Kitchen code.");
  if (isSupabaseConfigured()) {
    const sb = requireSupabase();
    const { error } = await sb.rpc("join_kitchen_by_code", { p_code: clean });
    if (error) throw new Error(error.message.includes("No Kitchen") ? "No Kitchen with that code." : error.message);
    const k = await sbGetMyKitchen();
    if (!k) throw new Error("Joined, but the Kitchen didn't load. Refresh and retry.");
    return k;
  }
  // Local demo has no shared backend, so we open a local Kitchen under that code.
  const kitchen: KitchenState = {
    id: `local-k-${Date.now()}`,
    name: "Joined Kitchen",
    governance: "mutual",
    joinCode: clean,
    members: [{ ...youMember(current), role: "chef" }],
  };
  writeLocalKitchen(kitchen);
  writeLocalProfile({ ...current, current_kitchen: kitchen.name });
  return kitchen;
}

/**
 * LOCAL DEMO ONLY: add a clearly-labelled practice co-chef so a single local tester
 * can reach quorum and experience voting. Never available on the real Supabase deploy.
 */
export async function addPracticeChef(): Promise<KitchenState> {
  if (isSupabaseConfigured()) {
    throw new Error("Practice chefs are local-demo only — invite a real chef with your code.");
  }
  const k = readLocalKitchen();
  if (!k) throw new Error("Form a Kitchen first.");
  const simCount = k.members.filter((m) => m.simulated).length;
  if (k.members.length >= 5) return k;
  const member: KitchenMemberLite = {
    userId: `sim-${Date.now()}`,
    alias: SIM_CHEF_NAMES[simCount % SIM_CHEF_NAMES.length],
    icon: SIM_ICONS[simCount % SIM_ICONS.length],
    memberNumber: null,
    role: "chef",
    isYou: false,
    simulated: true,
  };
  const updated = { ...k, members: [...k.members, member] };
  writeLocalKitchen(updated);
  return updated;
}

/** Leave / disband the caller's Kitchen membership. */
export async function leaveKitchen(): Promise<void> {
  if (isSupabaseConfigured()) {
    const sb = requireSupabase();
    const auth = await sbAuthUser();
    if (!auth) return;
    await sb.from("kitchen_members").delete().eq("user_id", auth.id);
    return;
  }
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_KITCHEN_KEY);
  } catch {
    /* non-fatal */
  }
}

/**
 * Each Kitchen member's latest vote on a ticker, as { userId: vote }. Powers the
 * real multi-user vote sync. Local demo returns {} (single user; practice chefs are
 * held in component state). Best-effort — never throws.
 */
export async function getKitchenVotes(ticker: string): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) return {};
  try {
    const sb = requireSupabase();
    const { data, error } = await sb.rpc("kitchen_votes_for", { p_ticker: ticker });
    if (error) return {};
    const out: Record<string, string> = {};
    for (const row of (data ?? []) as Array<Record<string, unknown>>) {
      out[String(row.member_user)] = String(row.vote);
    }
    return out;
  } catch {
    return {};
  }
}
