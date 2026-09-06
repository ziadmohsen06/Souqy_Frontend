import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import type { ApiErrorBody } from '@/types';

/**
 * Single axios instance for the whole app.
 *
 * baseURL defaults to `/api/v1`, which Vite proxies to the .NET backend in
 * development (see vite.config.ts). In production set VITE_API_URL to the
 * deployed API origin, e.g. https://api.souqy.com/api/v1.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/** Normalised error every service call rejects with. */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: Record<string, string[]>;
  readonly isNetworkError: boolean;

  constructor(message: string, status: number, details?: Record<string, string[]>, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiErrorBody>;
    if (!axiosErr.response) {
      return new ApiError(
        'Cannot reach the server. Make sure the API (or mock server) is running.',
        0,
        undefined,
        true
      );
    }
    const body = axiosErr.response.data;
    const message =
      body?.message ||
      (axiosErr.response.status === 404 ? 'Not found' : axiosErr.message) ||
      'Request failed';
    return new ApiError(message, axiosErr.response.status, body?.errors);
  }

  return new ApiError(err instanceof Error ? err.message : 'Unexpected error', 500);
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(toApiError(error));
  }
);

export default api;
