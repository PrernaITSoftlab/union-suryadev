import axios from 'axios';

const CLOUD_API_URL = 'https://mpvmakas.onrender.com/api';
let rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

const isLoopbackHost = (host) => {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
};

const isLanHost = (host) => {
  return (
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
    host.endsWith('.local')
  );
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLoopback = isLoopbackHost(hostname);
    const isLan = isLanHost(hostname);

    // If client is running on production domain (https://mpvmavaks.in, Vercel, or custom domain):
    // Use direct Render backend URL so requests never hit Vercel's 10-second serverless proxy timeout.
    if (!isLoopback && !isLan) {
      if (rawBaseUrl && !rawBaseUrl.startsWith('/') && !rawBaseUrl.includes('localhost') && !rawBaseUrl.includes('127.0.0.1')) {
        return rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
      }
      return CLOUD_API_URL;
    }

    // In local development (PC or smartphone testing over LAN):
    // Use relative '/api' which routes through Vite's dev server proxy to port 5000.
    if (isLoopback || isLan) {
      return '/api';
    }
  }

  // Handle explicitly configured base URL
  if (rawBaseUrl) {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (!isLoopbackHost(hostname) && (rawBaseUrl.includes('127.0.0.1') || rawBaseUrl.includes('localhost'))) {
        return CLOUD_API_URL;
      }
    }
    return rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
  }

  return CLOUD_API_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 seconds to allow Render free tier to wake from sleep seamlessly
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

// Smart Network & Gateway Timeout Retry Interceptor:
// If request fails due to cold start timeout (ECONNABORTED), proxy error (500/502/503/504),
// or connection drop, automatically retry with intelligent target switching.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retried || typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const isProxyDownError = error.response && [500, 502, 503, 504].includes(error.response.status);
    const isNetworkError = !error.response;
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');

    if (isNetworkError || isProxyDownError || isTimeout) {
      originalRequest._retried = true;
      const hostname = window.location.hostname;
      const isLoopback = isLoopbackHost(hostname);
      const isLan = isLanHost(hostname);

      if (isLoopback || isLan) {
        // In local development: if local port 5000 is not running, fall back to live Render backend
        try {
          originalRequest.baseURL = CLOUD_API_URL;
          return await axios(originalRequest);
        } catch (cloudErr) {
          return Promise.reject(cloudErr);
        }
      } else {
        // On production: if direct Render failed, try Vercel proxy '/api', or vice versa
        const currentTarget = originalRequest.baseURL || '';
        const alternateTarget = currentTarget.includes('onrender.com') ? '/api' : CLOUD_API_URL;

        try {
          originalRequest.baseURL = alternateTarget;
          return await axios(originalRequest);
        } catch (retryErr) {
          return Promise.reject(retryErr);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
