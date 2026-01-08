import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/wordle-duel/' : '/',
    plugins: [react()],
    server: {
      port: 3001,
      proxy:
        mode === 'development'
          ? {
              '/api': {
                target: 'http://localhost:8088',
                changeOrigin: true,
              },
            }
          : undefined,
    },
  };
});
