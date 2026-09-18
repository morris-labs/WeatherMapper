import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Leave VITE_BASE_PATH unset in dev (defaults to '/').
  // Set to '/weathermapper/' for production builds served under the subpath.
  base: process.env.VITE_BASE_PATH || '/',
});
