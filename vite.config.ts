import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/mmmv2.ts'),
      name: 'mmmv2',
      fileName: 'mmmv2',
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    target: 'es2024',
    minify: 'esbuild',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});