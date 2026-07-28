import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_ORIGIN = 'http://localhost:5201';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    // Proxying keeps the browser on a single origin in development, exactly as
    // it is in production where the API serves the built SPA. That is what lets
    // the session cookie work without CORS or SameSite=None.
    proxy: {
      '/api': { target: API_ORIGIN, changeOrigin: false },
      '/uploads': { target: API_ORIGIN, changeOrigin: false },
    },
  },

  build: {
    // Build straight into the API's wwwroot so `dotnet run` serves the SPA.
    // Uploads live outside wwwroot, so emptying it here is safe.
    outDir: '../api/Ambot365.Api/wwwroot',
    emptyOutDir: true,
  },
});
