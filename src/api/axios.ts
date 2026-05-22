import axios from 'axios';
import { useAuthStore, getRefreshToken } from '../stores/auth.store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Navigation ref — set from RootNavigator via setNavigationRef
let navigationRef: { navigate: (screen: string) => void } | null = null;

export function setNavigationRef(ref: { navigate: (screen: string) => void }) {
  navigationRef = ref;
}

// Concurrency limiter
let activeRequests = 0;
const MAX_CONCURRENT = 5;

// Request interceptor: concurrency cap + Bearer token
api.interceptors.request.use(
  async (config) => {
    while (activeRequests >= MAX_CONCURRENT) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    activeRequests++;
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh token queue
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

// Response interceptor: decrement concurrency counter + handle 401 and refresh
api.interceptors.response.use(
  (res) => { activeRequests--; return res; },
  async (error) => {
    activeRequests--;
    const original = error.config;

    // No response = network-level failure (offline, timeout, DNS) — reject immediately
    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        const MAX_QUEUE = 10;
        return new Promise<string>((resolve, reject) => {
          if (failedQueue.length >= MAX_QUEUE) {
            reject(new Error('Too many queued requests — please try again.'));
            return;
          }
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newToken: string = data.data.accessToken;
        const newRefreshToken: string = data.data.refreshToken;
        const user = useAuthStore.getState().user;

        if (user) {
          await useAuthStore.getState().setAuth(user, newToken, newRefreshToken);
        } else {
          useAuthStore.getState().setAccessToken(newToken);
        }

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        await useAuthStore.getState().logout();
        if (navigationRef) {
          navigationRef.navigate('Login');
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
