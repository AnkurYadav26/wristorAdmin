import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The standalone admin API runs on its own port (admin/server/.env sets PORT=8001).
// Override with VITE_API_TARGET if you change the admin backend port.
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:8001';

export default defineConfig({
  plugins: [react()],
  server: {
    // The admin panel is a standalone app on its own port (the storefront uses 5173).
    // Must be listed in CLIENT_ORIGINS in admin/server/.env (http://localhost:5174).
    port: 5174,
    proxy: {
      // Proxying keeps browser requests same-origin, so the httpOnly admin cookie just works.
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
});
