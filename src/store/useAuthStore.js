import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API } from '../config/api';

const authBase = `${API.base}/api/v1/auth`;

const useAuthStore = create(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isGuest: false,
      loginError: null,
      registerError: null,
      isLoggingIn: false,
      isRegistering: false,

      get isAuthenticated() {
        return !!get().accessToken;
      },

      setGuest: () => set({ isGuest: true, user: null, accessToken: null, refreshToken: null }),

      login: async (email, password) => {
        set({ isLoggingIn: true, loginError: null });
        try {
          const res = await fetch(`${authBase}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err?.error?.message || 'Login failed');
          }
          const data = await res.json();
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isLoggingIn: false,
            loginError: null,
          });
          return true;
        } catch (err) {
          set({ loginError: err.message, isLoggingIn: false });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ isRegistering: true, registerError: null });
        try {
          const res = await fetch(`${authBase}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err?.error?.message || 'Registration failed');
          }
          const data = await res.json();
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isRegistering: false,
            registerError: null,
          });
          return true;
        } catch (err) {
          set({ registerError: err.message, isRegistering: false });
          return false;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await fetch(`${authBase}/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
          }
        } catch {
          // ignore logout errors
        }
        set({ user: null, accessToken: null, refreshToken: null, isGuest: false, loginError: null, registerError: null });
      },

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      clearErrors: () => set({ loginError: null, registerError: null }),
    }),
    {
      name: 'splitmate-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isGuest: state.isGuest,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
      // Use Zustand persist hasHydrated via store
    }
  )
);

export default useAuthStore;
