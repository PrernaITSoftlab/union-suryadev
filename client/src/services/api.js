import axios from 'axios';

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

    // If client is running locally (localhost or smartphone on LAN):
    // 1. If loaded from Vite dev server / frontend (e.g. port 3000 or 5173),
    //    relative '/api' routes through Vite's dev server proxy to port 5000 seamlessly
    //    without exposing internal loopback IPs to smartphones.
    if (isLoopback || isLan) {
      if (rawBaseUrl && !rawBaseUrl.startsWith('/') && !rawBaseUrl.includes('localhost') && !rawBaseUrl.includes('127.0.0.1')) {
        // Explicit remote URL provided (e.g. Render/production API)
        return rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
      }
      return '/api';
    }
  }

  // Handle explicitly configured base URL
  if (rawBaseUrl) {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // If VITE_API_URL was baked in with 127.0.0.1 or localhost, but client is accessed from LAN (e.g. smartphone),
      // rewrite loopback address to the actual device/host IP
      if (!isLoopbackHost(hostname) && (rawBaseUrl.includes('127.0.0.1') || rawBaseUrl.includes('localhost'))) {
        const rewritten = rawBaseUrl
          .replace('://127.0.0.1', `://${hostname}`)
          .replace('://localhost', `://${hostname}`);
        return rewritten.endsWith('/api') ? rewritten : `${rewritten}/api`;
      }
    }
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
// If request to /api fails with Network Error (no response) or Vite proxy failure (500/502/503/504),
// automatically retry against port 5000 directly using the appropriate host (resolving localhost for PC, LAN IP for smartphones)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retried || typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const isProxyDownError = error.response && [500, 502, 503, 504].includes(error.response.status) && (originalRequest.baseURL === '/api' || !originalRequest.baseURL);
    const isNetworkError = !error.response;

    if (isNetworkError || isProxyDownError) {
      originalRequest._retried = true;
      const hostname = window.location.hostname;
      const isLoopback = isLoopbackHost(hostname);
      const isLan = isLanHost(hostname);

      if (isLoopback || isLan) {
        // Fallback target: use host IP on smartphones so it doesn't query the smartphone's internal loopback
        const targetHost = isLoopback ? '127.0.0.1' : hostname;
        const fallbackTarget = `http://${targetHost}:5000/api`;

        try {
          originalRequest.baseURL = fallbackTarget;
          return await axios(originalRequest);
        } catch (retryErr) {
          // If 127.0.0.1 also failed on PC, try localhost:5000
          if (isLoopback && (!retryErr.response || [500, 502, 503, 504].includes(retryErr.response.status))) {
            try {
              originalRequest.baseURL = 'http://localhost:5000/api';
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
