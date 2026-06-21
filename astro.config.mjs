import { defineConfig } from 'astro/config';

const apiUrl = process.env.PUBLIC_API_URL || process.env.VITE_API_URL || '';

export default defineConfig({
  site: 'https://lutfiihsan.github.io',
  output: 'static',
  build: {
    format: 'directory',
  },
  redirects: {
    '/admin': '/admin/',
    '/blog-post': '/blog/post/',
    '/blog.html': '/blog/',
    '/project.html': '/project/',
  },
  vite: {
    envPrefix: ['PUBLIC_', 'VITE_'],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
        '/admin': {
          target: 'http://127.0.0.1:5173',
          changeOrigin: true,
        },
      },
    },
  },
  define: {
    'import.meta.env.PUBLIC_API_URL': JSON.stringify(apiUrl),
  },
});
