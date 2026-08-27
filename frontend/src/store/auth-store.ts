import { toast } from "@/components/ui/toast";
import { create } from "zustand";
import { env } from "../env";
import authFetch from "@/lib/auth-fetch";

type User = {
  email: string;
  id: number;
};

type AuthResponse = {
  user: User;
  accessToken: string;
  message?: string;
};

type UseAuthStore = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: User | null;
  accessToken: string | null;
  isRefreshing: boolean;
  signup: (credentials: {
    email: string;
    password: string;
  }) => Promise<boolean>;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  refreshToken: () => Promise<boolean | null>;
};

export const useAuth = create<UseAuthStore>((set) => ({
  isAuthenticated: false,
  isAuthLoading: false,
  user: null,
  accessToken: null,
  isRefreshing: false,

  async signup({ email, password }: { email: string; password: string }) {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (response.ok) {
      set({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
      });
      toast.add({
        title: "Signup Successful",
      });

      return true;
    }

    toast.add({
      title: "Signup Failed",
      description: data.message || "An error occurred during signup.",
    });

    return false;
  },

  async login({ email, password }: { email: string; password: string }) {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (response.ok) {
      set({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
      });
      toast.add({
        title: "Login Successful",
      });

      return true;
    }

    toast.add({
      title: "Login Failed",
      description: data.message || "An error occurred during login.",
    });

    return false;
  },

  async logout() {
    const [_, error] = await authFetch(`/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!error) {
      set({ isAuthenticated: false, user: null, accessToken: null });
      window.cookieStore.delete("accessToken");
      toast.add({
        title: "Logout Successful",
        description: "You have been logged out.",
      });

      return true;
    }

    toast.add({
      title: "Logout Failed",
      description: error.message || "An error occurred during logout.",
    });

    return false;
  },

  async refreshToken() {
    if (useAuth.getState().isRefreshing) {
      return null; // Prevent multiple refresh attempts
    }

    set({ isRefreshing: true });
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
      },
    );

    const data = await response.json();

    if (response.ok) {
      set({ accessToken: data.accessToken });
      return true;
    }

    set({ isRefreshing: false });

    return false;
  },

  async getCurrentUser() {
    set({ isAuthLoading: true });
    const [data, _] = await authFetch<{ user: User }>(`/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (data) {
      set({ isAuthenticated: true, user: data.user, isAuthLoading: false });
      return;
    }

    set({ isAuthenticated: false, user: null, isAuthLoading: false });
  },
}));
