import axios from 'axios';
import Cookies from 'js-cookie';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL
});


api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('token') ;
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => {
    try {
      const body: any = response?.data;
      const message = body?.message || body?.error || body?.Message;
      const statusText = body?.status || body?.Status;
      if (
        (typeof message === 'string' && message.toLowerCase().includes('token expired')) ||
        (typeof statusText === 'string' && statusText.toLowerCase() === 'error' && typeof message === 'string' && message.toLowerCase().includes('token expired'))
      ) {
        authService.handleSessionExpired(message);
      }
    } catch {}
    return response;
  },
  (error: any) => {
    try {
      if (authService.isTokenExpiredError(error)) {
        authService.handleSessionExpired(error?.response?.data?.message);
      }
    } catch {}
    try {
      const message = error?.response?.data?.message || error?.message || 'Request failed';
      // Avoid toasting on cancellations
      if (!axios.isCancel(error)) {
        toast.error(message);
      }
    } catch {}
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;