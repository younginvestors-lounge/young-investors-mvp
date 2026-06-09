/**
 * Young Investors API client.
 *
 * Single source of truth for talking to the Django backend. Handles JWT storage,
 * transparent access-token refresh, structured error parsing, request timeouts,
 * and resolving relative media paths to absolute URLs.
 *
 * MOCK_MVP_PAPER_TRADING_ONLY — no real-money endpoints exist or are called.
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const ACCESS_KEY = "yi_access_token";
const REFRESH_KEY = "yi_refresh_token";
const DEFAULT_TIMEOUT_MS = 15000;

/* ── Types ── */

export interface SignupPayload {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  display_name?: string;
  chef_alias: string;
  age?: number | null;
  intent?: string;
  profile_icon?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChefUser {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  chef_alias: string;
  age: number | null;
  intent: string;
  email_verified: boolean;
  is_training_mode: boolean;
  mode?: string;
  onboarding_completed?: boolean;
  member_number: number | null;
  academy_score: number;
  kitchen_score: number;
  personal_prediction_score: number;
  profile_picture: string | null;
  profile_icon: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: ChefUser;
}

export interface UpdateProfilePayload {
  display_name?: string;
  chef_alias?: string;
  age?: number | null;
  intent?: string;
  profile_icon?: string;
  profile_picture?: File;
  mode?: string;
  onboarding_completed?: boolean;
}

/**
 * Structured API error. `fieldErrors` maps backend field names to messages so a
 * form can highlight the right input; `message` is always a human-readable line.
 */
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  code?: string;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

/* ── Token storage ── */

const tokenStore = {
  getAccess(): string | null {
    return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    return typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh?: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

/* ── Helpers ── */

/** Turn any backend error body into a flat, displayable message + field map. */
function parseErrorBody(status: number, body: unknown): ApiError {
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;

    // Explicit single-error shape: {"error": "...", "code": "..."}
    if (typeof obj.error === "string") {
      return new ApiError(status, obj.error, {}, typeof obj.code === "string" ? obj.code : undefined);
    }

    // DRF field errors: {"email": ["..."], "password": ["..."]}
    const fieldErrors: Record<string, string> = {};
    const messages: string[] = [];
    for (const [key, val] of Object.entries(obj)) {
      const text = Array.isArray(val) ? val.join(" ") : String(val);
      if (key === "non_field_errors" || key === "detail") {
        messages.push(text);
      } else {
        fieldErrors[key] = text;
        messages.push(text);
      }
    }
    if (messages.length > 0) {
      return new ApiError(status, messages[0], fieldErrors);
    }
  }
  return new ApiError(status, `Request failed (${status}).`);
}

/** Resolve a possibly-relative media path returned by Django to an absolute URL. */
export function resolveMediaUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/* ── Core request with timeout + transparent refresh ── */

class APIClient {
  private baseURL: string;
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async rawFetch(path: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(`${this.baseURL}${path}`, { ...init, signal: controller.signal });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ApiError(0, "The request timed out. Check your connection and try again.");
      }
      throw new ApiError(0, "Can't reach the kitchen right now. Is the server running?");
    } finally {
      clearTimeout(timer);
    }
  }

  /** Exchange the refresh token for a new access token. De-duplicated across callers. */
  private async refreshAccess(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;

    const refresh = tokenStore.getRefresh();
    if (!refresh) return false;

    this.refreshInFlight = (async () => {
      try {
        const res = await this.rawFetch("/api/token/refresh/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data.access) {
          tokenStore.set(data.access, data.refresh);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshInFlight = null;
      }
    })();

    return this.refreshInFlight;
  }

  /** Authenticated JSON request; retries once after a transparent token refresh on 401. */
  private async authedJson<T>(path: string, init: RequestInit): Promise<T> {
    const send = async (): Promise<Response> => {
      const access = tokenStore.getAccess();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string>),
      };
      if (access) headers.Authorization = `Bearer ${access}`;
      return this.rawFetch(path, { ...init, headers });
    };

    let res = await send();
    if (res.status === 401 && (await this.refreshAccess())) {
      res = await send();
    }
    return this.handle<T>(res);
  }

  private async publicJson<T>(path: string, body: unknown): Promise<T> {
    const res = await this.rawFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handle<T>(res);
  }

  private async handle<T>(res: Response): Promise<T> {
    if (res.status === 204) return undefined as T;
    let body: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    if (!res.ok) throw parseErrorBody(res.status, body);
    return body as T;
  }

  /* ── Public endpoints ── */

  signup(payload: SignupPayload) {
    return this.publicJson<{ message: string; user: ChefUser }>("/api/auth/signup/", payload);
  }

  verifyEmail(token: string) {
    return this.publicJson<{ message: string }>("/api/auth/verify_email/", { token });
  }

  async login(payload: LoginPayload): Promise<AuthTokens> {
    const data = await this.publicJson<AuthTokens>("/api/auth/login/", payload);
    tokenStore.set(data.access, data.refresh);
    return data;
  }

  passwordResetRequest(email: string) {
    return this.publicJson<{ message: string }>("/api/auth/password_reset_request/", { email });
  }

  passwordResetConfirm(token: string, password: string, password_confirm: string) {
    return this.publicJson<{ message: string }>("/api/auth/password_reset_confirm/", {
      token,
      password,
      password_confirm,
    });
  }

  /* ── Authenticated endpoints ── */

  me() {
    return this.authedJson<ChefUser>("/api/auth/me/", { method: "GET" });
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<ChefUser> {
    // multipart when a file is present, JSON otherwise.
    const access = tokenStore.getAccess();
    let res: Response;

    if (payload.profile_picture) {
      const form = new FormData();
      if (payload.chef_alias !== undefined) form.append("chef_alias", payload.chef_alias);
      if (payload.age !== undefined) form.append("age", String(payload.age));
      if (payload.intent !== undefined) form.append("intent", payload.intent);
      if (payload.profile_icon !== undefined) form.append("profile_icon", payload.profile_icon);
      form.append("profile_picture", payload.profile_picture);
      res = await this.rawFetch("/api/auth/update_profile/", {
        method: "PATCH",
        headers: access ? { Authorization: `Bearer ${access}` } : {},
        body: form,
      });
      if (res.status === 401 && (await this.refreshAccess())) {
        const retryAccess = tokenStore.getAccess();
        res = await this.rawFetch("/api/auth/update_profile/", {
          method: "PATCH",
          headers: retryAccess ? { Authorization: `Bearer ${retryAccess}` } : {},
          body: form,
        });
      }
      const data = await this.handle<{ message: string; user: ChefUser }>(res);
      return data.user;
    }

    const data = await this.authedJson<{ message: string; user: ChefUser }>("/api/auth/update_profile/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return data.user;
  }

  /* ── Session ── */

  isAuthenticated(): boolean {
    return !!tokenStore.getAccess();
  }

  logout(): void {
    tokenStore.clear();
  }
}

export const apiClient = new APIClient();
