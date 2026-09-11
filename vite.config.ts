import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
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
          '/admin/users': {
            target: DEV_BACKEND_ORIGIN,
            changeOrigin: true,
          },
          '/admin/rooms': {
            target: DEV_BACKEND_ORIGIN,
            changeOrigin: true,
          },
        }
      : undefined;

  return {
    base: '/',
    plugins: [
      react(),
      svgr(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        workbox: {
          navigateFallbackDenylist: [/^\/wordle-duel-service(?:\/|$)/],
        },
        manifest: {
          name: 'Wordle Duel',
          short_name: 'Wordle Duel',
          display: 'standalone',
          start_url: '/',
          theme_color: '#0d1320',
          background_color: '#ffffff',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    server: {
      port: 3001,
      proxy,
    },
  };
});
