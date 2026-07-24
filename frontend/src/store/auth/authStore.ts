import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { login as apiLogin } from "../../api/auth";

import { UserRole } from "../../types/roles";
import type { AuthUser, AuthStore } from "./types";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      status: "idle",

      setCredentials: (user: AuthUser, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
          status: "authenticated",
        }),

      login: async (email: string, password: string) => {
        set({ status: "loading" });
        try {
          const data = await apiLogin(email, password);
          const authUser: AuthUser = {
            id: data.user.id,
            role: data.user.role as UserRole,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
          };
          set({
            user: authUser,
            token: data.access_token,
            isAuthenticated: true,
            status: "authenticated",
          });
          return authUser;
        } catch (error) {
          set({ status: "unauthenticated" });
          throw error;
        }
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          status: "unauthenticated",
        }),

      setStatus: (status: AuthStore["status"]) => set({ status }),

      refreshUser: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const { getCurrentUser } = await import("../../api/auth");
          const data = await getCurrentUser();
          set({
            user: {
              id: data.id,
              role: data.role,
              first_name: data.first_name,
              last_name: data.last_name,
            },
          });
        } catch (error) {
          console.error("Failed to refresh user:", error);
        }
      },
    }),
    {
      name: "nexus-auth-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
