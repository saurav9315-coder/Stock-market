/**
 * Antigravity Quant - Institutional Axios API Client
 * 
 * Provides automated JWT headers injection, 401 interceptors,
 * token refresh rotations, rate limit alerts, and offline handlers.
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Memory token store (fallback from localStorage)
let accessTokenMemoryStore: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessTokenMemoryStore = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('aq_access_token', token);
    } else {
      localStorage.removeItem('aq_access_token');
    }
  }
};

export const getAccessToken = (): string | null => {
  if (accessTokenMemoryStore) return accessTokenMemoryStore;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('aq_access_token');
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('aq_refresh_token');
  }
  return null;
};

export const setRefreshToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('aq_refresh_token', token);
    } else {
      localStorage.removeItem('aq_refresh_token');
    }
  }
};

// Main Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Interceptor refresh state tracking
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token & Offline Check
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Offline detection
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return Promise.reject(new Error('OFFLINE_MODE'));
    }

    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Token rotation, global status error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle offline states
    if (error.message === 'OFFLINE_MODE' || (error.code === 'ERR_NETWORK' && typeof window !== 'undefined' && !navigator.onLine)) {
      toast.error('Network Connectivity Offline', {
        description: 'Trading dashboard loaded in offline cache mode.',
      });
      return Promise.reject({
        status: 0,
        message: 'Network offline. Running on cached simulation parameters.',
        isOffline: true,
      });
    }

    if (!error.response) {
      return Promise.reject({
        status: 500,
        message: error.message || 'System network channel error.',
      });
    }

    const status = error.response.status;

    // 401 Interceptor: Expired Access Token
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('Refresh token not present.');
        }

        // Perform token refresh request
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        setAccessToken(accessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        // Force logout & clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aq_user');
          localStorage.removeItem('aq_access_token');
          localStorage.removeItem('aq_refresh_token');
          window.location.href = '/session-expired';
        }
        return Promise.reject({
          status: 401,
          message: 'Session has expired. Re-authentication mandatory.',
        });
      }
    }

    // Global HTTP status errors formatting
    const errData = error.response.data as any;
    const formattedError = {
      status,
      message: errData?.message || errData?.error || `API Error: Status ${status}`,
      errors: errData?.errors || null,
    };

    const now = Date.now();
    const lastToast = (globalThis as any)._lastErrorToastTime || 0;

    if (now - lastToast > 3000) {
      (globalThis as any)._lastErrorToastTime = now;
      if (status === 429) {
        toast.error('Rate Limit Triggered', {
          description: 'Maximum requests reached. Rate limit throttle applied.',
        });
      } else if (status === 403) {
        toast.error('Permission Denied', {
          description: 'User access role insufficient to perform this administrative task.',
        });
      } else if (status === 500) {
        toast.error('Server Integration Failure', {
          description: 'A critical database or cloud execution failure occurred.',
        });
      }
    }

    return Promise.reject(formattedError);
  }
);

// Backward-compatible api object
export const api = {
  get: <T = any>(endpoint: string, config?: any): Promise<T> =>
    apiClient.get<T>(endpoint, config).then((r) => r.data),
  post: <T = any>(endpoint: string, data?: any, config?: any): Promise<T> =>
    apiClient.post<T>(endpoint, data, config).then((r) => r.data),
  put: <T = any>(endpoint: string, data?: any, config?: any): Promise<T> =>
    apiClient.put<T>(endpoint, data, config).then((r) => r.data),
  delete: <T = any>(endpoint: string, config?: any): Promise<T> =>
    apiClient.delete<T>(endpoint, config).then((r) => r.data),
};
