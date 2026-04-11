import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    injectHTML(),
  ],
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
