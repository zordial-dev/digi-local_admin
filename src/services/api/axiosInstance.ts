import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../../constants/env.constants';
import { storage } from '../../utils/storage.utils';

// AbortController Map for Request Cancellation
const activeCancelTokens = new Map<string, AbortController>();

export const getRequestCancelToken = (requestKey: string): AbortSignal => {
  if (activeCancelTokens.has(requestKey)) {
    activeCancelTokens.get(requestKey)?.abort();
  }
  const controller = new AbortController();
  activeCancelTokens.set(requestKey, controller);
  return controller.signal;
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Authorization Bearer token & ENV header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken() || storage.getAdminToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 automatic token refresh queue & Retry Logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Ignore request cancellation errors
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = storage.getRefreshToken();

      if (!refreshToken || originalRequest.url?.includes('/login')) {
        storage.clearAuth();
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<{ accessToken: string; token?: string }>(
          `${ENV.API_BASE_URL}/vendors/refresh`,
          { refreshToken }
        );

        const newAccessToken = response.data.accessToken || response.data.token;
        if (newAccessToken) {
          storage.setAccessToken(newAccessToken);
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Missing access token in refresh response');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        storage.clearAuth();
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
