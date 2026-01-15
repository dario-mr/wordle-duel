import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

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
          '/oauth2': {
            target: DEV_BACKEND_ORIGIN,
            changeOrigin: true,
          },
          '/auth': {
            target: DEV_BACKEND_ORIGIN,
            changeOrigin: true,
          },
          '/logout': {
            target: DEV_BACKEND_ORIGIN,
            changeOrigin: true,
          },
        }
      : undefined;

  return {
    base: mode === 'production' ? '/wordle-duel/' : '/',
    plugins: [react(), svgr()],
    server: {
      port: 3001,
      proxy,
    },
  };
});
