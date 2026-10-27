import axios from 'axios';

let rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

const getBaseUrl = () => {
  // If running in browser and on local development (localhost, 127.0.0.1, ::1):
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    
    // In local dev, '/api' routes through Vite's dev server proxy to port 5000 seamlessly
    if (isLocal) {
      return '/api';
    }
  }

  if (rawBaseUrl) {
    return rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
  }

  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  },
  timeout: 15000
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('union_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Smart Network Error Retry Interceptor:
// If request to /api fails with Network Error (no response) on localhost, automatically retry against port 5000 directly
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response && !originalRequest._retried && typeof window !== 'undefined') {
      originalRequest._retried = true;
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

      if (isLocal) {
        // Try fallback to direct port 5000
        const fallbackTarget = originalRequest.baseURL === '/api'
          ? `http://127.0.0.1:5000/api`
          : '/api';

        try {
          originalRequest.baseURL = fallbackTarget;
          return await axios(originalRequest);
        } catch (retryErr) {
          // If 127.0.0.1 also failed, try localhost:5000
          if (!retryErr.response && fallbackTarget.includes('127.0.0.1')) {
            try {
              originalRequest.baseURL = `http://localhost:5000/api`;
              return await axios(originalRequest);
            } catch (err3) {
              return Promise.reject(err3);
            }
          }
          return Promise.reject(retryErr);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
