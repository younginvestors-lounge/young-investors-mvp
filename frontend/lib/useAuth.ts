import { useState, useEffect, useCallback } from "react";
import { apiClient, ChefUserResponse, SignupPayload, LoginPayload } from "./api-client";

export interface AuthState {
  user: ChefUserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Restore auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("yi_access_token") : null;

      if (!token) {
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
        return;
      }

      try {
        const user = await apiClient.me();
        setState({ user, isAuthenticated: true, isLoading: false, error: null });
      } catch (err) {
        localStorage.removeItem("yi_access_token");
        localStorage.removeItem("yi_refresh_token");
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    };

    checkAuth();
  }, []);

  const signup = useCallback(
    async (payload: SignupPayload) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await apiClient.signup(payload);
        // Don't auto-login after signup; user must verify email first
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Signup failed";
        setState({ user: null, isAuthenticated: false, isLoading: false, error: errorMsg });
        throw err;
      }
    },
    []
  );

  const login = useCallback(async (payload: LoginPayload) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.login(payload);
      setState({ user: response.user, isAuthenticated: true, isLoading: false, error: null });
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setState({ user: null, isAuthenticated: false, isLoading: false, error: errorMsg });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<ChefUserResponse>) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.updateProfile(updates);
      setState({ user: response.user, isAuthenticated: true, isLoading: false, error: null });
      return response.user;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Profile update failed";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
      throw err;
    }
  }, []);

  return {
    ...state,
    signup,
    login,
    logout,
    updateProfile,
  };
}
