"use client";

/**
 * Shared authentication context. One source of truth for the signed-in Chef,
 * provided at the root layout so every page and component sees the same state.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  apiClient,
  ApiError,
  ChefUser,
  LoginPayload,
  SignupPayload,
  UpdateProfilePayload,
} from "./api-client";

interface AuthContextValue {
  user: ChefUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (payload: SignupPayload) => Promise<{ message: string; user: ChefUser }>;
  login: (payload: LoginPayload) => Promise<ChefUser>;
  logout: () => void;
  updateProfile: (payload: UpdateProfilePayload) => Promise<ChefUser>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ChefUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!apiClient.isAuthenticated()) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const me = await apiClient.me();
        if (!cancelled) setUser(me);
      } catch (err) {
        // Only drop the session on a real auth failure, not on a transient
        // network error — that would log people out every time the API blips.
        if (err instanceof ApiError && err.status === 401) {
          apiClient.logout();
          if (!cancelled) setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    // Signup does not authenticate — the user must verify their email first.
    return apiClient.signup(payload);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await apiClient.login(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await apiClient.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  const refreshUser = useCallback(async () => {
    if (!apiClient.isAuthenticated()) return;
    const me = await apiClient.me();
    setUser(me);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      signup,
      login,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, isLoading, signup, login, logout, updateProfile, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>. Wrap the app in layout.tsx.");
  }
  return ctx;
}
