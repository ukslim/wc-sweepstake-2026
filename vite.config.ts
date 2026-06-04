import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/',
    server: {
      proxy: {
        '/api/matches': {
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.FOOTBALL_DATA_API_KEY;
              if (key) {
                proxyReq.setHeader('X-Auth-Token', key);
              }
            });
          },
          rewrite: () => '/v4/competitions/WC/matches?season=2026',
          target: 'https://api.football-data.org',
        },
      },
    },
  };
});
