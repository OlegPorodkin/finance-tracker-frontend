import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import type { ApiError } from '@/types';
import { useAuthStore } from '@/store/auth.store';

const client: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  pendingQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: InternalAxiosRequestConfig & { _retry?: boolean } = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          pendingQueue.push({ resolve: () => resolve(), reject });
        }).then(() => client(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        processQueue(null);
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().logout();
        window.location.replace('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const status: number | undefined = error.response?.status;
    const apiError: ApiError = {
      status: status ?? 0,
      message: error.response?.data?.message ?? error.message,
      errors: error.response?.data?.errors,
    };

    if (status === 400) {
      return Promise.reject(apiError);
    }

    if (status === 403) toast.error('Access denied');
    else if (status === 404) toast.error('Resource not found');
    else if (status === 429) toast.error('Too many requests, please try again later');
    else if (status !== undefined && status >= 500) toast.error('Server error, please try again later');
    else if (!status) toast.error('No connection to server');

    return Promise.reject(apiError);
  }
);

export default client;
