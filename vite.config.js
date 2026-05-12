import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
    sourcemap: false,
    minify: true,
  }
});
