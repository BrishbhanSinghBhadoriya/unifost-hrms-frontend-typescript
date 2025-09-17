import axios from 'axios';
import Cookies from 'js-cookie';

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
  (response) => response,
  (error:Error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;