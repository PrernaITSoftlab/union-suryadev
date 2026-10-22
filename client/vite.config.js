import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawTarget = env.VITE_API_URL || env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
  const target = rawTarget.startsWith('http') ? rawTarget.replace(/\/api\/?$/, '') : 'http://127.0.0.1:5000';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});