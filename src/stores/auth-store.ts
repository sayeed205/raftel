import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginRequest } from '@/types/api';
import qbApi from '@/lib/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  username: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      isLoading: false,
      error: null,
      username: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          await qbApi.login(credentials);

          set({
            isAuthenticated: true,
            isLoading: false,
            username: credentials.username,
            error: null,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Login failed';
          set({
            isAuthenticated: false,
            isLoading: false,
            error: message,
            username: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await qbApi.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error);
        } finally {
          set({
            isAuthenticated: false,
            isLoading: false,
            username: null,
            error: null,
          });
        }
      },

      checkAuth: async () => {
        const state = get();

        // Don't check if we're already loading
        if (state.isLoading) {
          return;
        }
        set({ isLoading: true });

        try {
          const isValid = await qbApi.checkAuth();

          set({
            isAuthenticated: isValid,
            isLoading: false,
            error: isValid ? null : null,
          });
        } catch (error) {
          set({
            isAuthenticated: false,
            isLoading: false,
            error: null, // Don't show error for initial check
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'qbittorrent-auth',
      partialize: (state) => ({
        // Only persist username, not authentication status
        // Authentication needs to be verified on each session
        username: state.username,
      }),
      // Add version to force reload if needed
      version: 1,
    },
  ),
);

// Selector hooks for convenience
export const useAuth = () => {
  const { isAuthenticated, isLoading, error, username } = useAuthStore();
  return { isAuthenticated, isLoading, error, username };
};

export const useAuthActions = () => {
  const { login, logout, checkAuth, clearError } = useAuthStore();
  return { login, logout, checkAuth, clearError };
};
