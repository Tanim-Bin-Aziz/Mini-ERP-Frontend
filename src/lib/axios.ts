import axios, { AxiosError } from 'axios';
import { store } from '@/store/store';
import { logout, setTokens } from '@/store/authSlice';
import type { ApiEnvelope, LoginResponse } from '@/types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const flushQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = store.getState().auth.refreshToken;
      if (!refreshToken) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<ApiEnvelope<Pick<LoginResponse, 'accessToken' | 'refreshToken'>>>(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        store.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));
        flushQueue(null, accessToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
