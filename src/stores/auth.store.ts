import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoaded: boolean; // true after first SecureStore check — gates navigation
  setAuth: (user: User, token: string, refreshToken: string, keepSignedIn?: boolean) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  setAccessToken: (token: string) => void;
  loadFromStorage: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isLoaded: false,

  setAuth: async (user: User, token: string, refreshToken: string, keepSignedIn = true) => {
    if (keepSignedIn) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, accessToken: token });
  },

  setUser: async (user: User) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  loadFromStorage: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        // keepSignedIn was false — clear any stale user data and stay logged out
        await SecureStore.deleteItemAsync(USER_KEY);
        set({ isLoaded: true });
        return;
      }
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      if (userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, isLoaded: true });
        return;
      }
    } catch {
      // Storage read failed — treat as logged out
    }
    set({ isLoaded: true });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch {
      // Ignore cleanup errors
    }
    set({ user: null, accessToken: null });
  },
}));

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};
