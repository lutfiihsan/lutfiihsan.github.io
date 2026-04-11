import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    injectHTML(),
  ],
  server: {
    // Middleware to support clean URLs (resolve /blog to /blog.html)
    proxy: {}, // Placeholder if needed
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url !== '/' && !req.url.includes('.') && !req.url.startsWith('/@')) {
          req.url += '.html';
        }
        next();
      });
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        blog: resolve(__dirname, 'blog.html'),
        blogpost: resolve(__dirname, 'blog-post.html'),
        project: resolve(__dirname, 'project.html'),
        error: resolve(__dirname, '404.html'),
      },
    },
  },
});
