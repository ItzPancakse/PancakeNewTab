// :3
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    rollupOptions: {
      input: {
        home: 'src/index.html',
        settings: 'src/settings/index.html',
      },
    },
    outDir: '../dist',
    emptyOutDir: true,
  },
});
