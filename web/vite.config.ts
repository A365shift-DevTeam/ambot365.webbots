import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `mode` selects which .env file applies: .env.development for `npm run dev`,
// .env.production for `npm run build`.
export default defineConfig(({ mode }) => {
  // The third argument '' loads every variable, not just VITE_-prefixed ones —
  // VITE_DEV_API_ORIGIN is only used here in the config and never shipped.
  const env = loadEnv(mode, process.cwd(), '');
  const devApiOrigin = env.VITE_DEV_API_ORIGIN || 'http://localhost:5201';

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      port: 5173,
      // Proxying keeps the browser on a single origin in development, so the
      // session cookie works without CORS. Production is genuinely cross-origin
      // and goes through VITE_API_BASE_URL instead.
      proxy: {
        '/api': { target: devApiOrigin, changeOrigin: false },
        '/uploads': { target: devApiOrigin, changeOrigin: false },
      },
    },

    build: {
      // A plain static bundle. The API no longer serves the SPA — this output is
      // copied to the demo.ambot365.com IIS site (see docs/DEPLOYMENT.md).
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
