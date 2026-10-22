import axios from 'axios';

let rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
let apiBaseUrl = '/api';

if (rawBaseUrl) {
  apiBaseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
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

export default api;
