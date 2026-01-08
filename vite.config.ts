import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEV_BACKEND_ORIGIN = 'http://localhost:8088';

export default defineConfig(({ mode }) => {
  const proxy =
    mode === 'development'
      ? {
          '/api': {
            target: DEV_BACKEND_ORIGIN,
            changeOrigin: true,
          },
          '/ws': {
            target: DEV_BACKEND_ORIGIN,
            changeOrigin: true,
            ws: true,
          },
        }
      : undefined;

  return {
    base: mode === 'production' ? '/wordle-duel/' : '/',
    plugins: [react()],
    server: {
      port: 3001,
      proxy,
    },
  };
});
