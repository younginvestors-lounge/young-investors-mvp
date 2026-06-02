const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export interface SignupPayload {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  chef_alias: string;
  age?: number;
  intent?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChefUserResponse {
  id: string;
  username: string;
  email: string;
  chef_alias: string;
  age: number | null;
  intent: string;
  email_verified: boolean;
  is_training_mode: boolean;
  academy_score: number;
  kitchen_score: number;
  personal_prediction_score: number;
  profile_picture: string | null;
  profile_icon: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: ChefUserResponse;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  token: string;
  password: string;
  password_confirm: string;
}

export interface UpdateProfilePayload {
  chef_alias?: string;
  profile_icon?: string;
  profile_picture?: File;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("yi_access_token");
  }

  private setAccessToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("yi_access_token", token);
  }

  private setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("yi_refresh_token", token);
  }

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const res = await fetch(`${this.baseURL}/api/auth/signup/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(JSON.stringify(error));
    }

    const data = await res.json();
    return data;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const res = await fetch(`${this.baseURL}/api/auth/verify_email/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(JSON.stringify(error));
    }

    return await res.json();
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${this.baseURL}/api/auth/login/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(JSON.stringify(error));
    }

    const data: AuthResponse = await res.json();
    this.setAccessToken(data.access);
    this.setRefreshToken(data.refresh);
    return data;
  }

  async me(): Promise<ChefUserResponse> {
    const res = await fetch(`${this.baseURL}/api/auth/me/`, {
      method: "GET",
      headers: this.getHeaders(true),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user");
    }

    return await res.json();
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<{ user: ChefUserResponse }> {
    const formData = new FormData();

    if (payload.chef_alias) {
      formData.append("chef_alias", payload.chef_alias);
    }

    if (payload.profile_icon) {
      formData.append("profile_icon", payload.profile_icon);
    }

    if (payload.profile_picture) {
      formData.append("profile_picture", payload.profile_picture);
    }

    const res = await fetch(`${this.baseURL}/api/auth/update_profile/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(JSON.stringify(error));
    }

    return await res.json();
  }

  async passwordResetRequest(email: string): Promise<{ message: string }> {
    const res = await fetch(`${this.baseURL}/api/auth/password_reset_request/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error("Password reset request failed");
    }

    return await res.json();
  }

  async passwordResetConfirm(payload: PasswordResetConfirmPayload): Promise<{ message: string }> {
    const res = await fetch(`${this.baseURL}/api/auth/password_reset_confirm/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Password reset failed");
    }

    return await res.json();
  }

  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("yi_access_token");
    localStorage.removeItem("yi_refresh_token");
  }
}

export const apiClient = new APIClient();
