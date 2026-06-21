import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'path';

const root = resolve(__dirname, 'admin');

export default defineConfig({
  base: '/admin/',
  root,
  publicDir: resolve(__dirname, 'public'),
  plugins: [react(), injectHTML()],
  resolve: {
    alias: {
      '@assets': resolve(__dirname, 'public/assets/js'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist/admin'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
      },
    },
  },
});
