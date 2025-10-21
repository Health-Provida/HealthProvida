// import { defineConfig } from ‘vite’;
// import vue from ‘@vitejs/plugin-vue’;

// export default defineConfig({
// root: ‘src’,
// base: ‘/my-app/’,
// server: {
// port: 3000,
// proxy: {
// ‘/api’: {
// target: ‘http://localhost:5000’,
// changeOrigin: true,
// }
// }
// },
// build: {
// outDir: ‘../dist’,
// sourcemap: true
// },
// plugins: [vue()],
// resolve: {
// alias: {
// ‘@’: ‘/src’
// }
// },
// css: {
// preprocessorOptions: {
// scss: {
// additionalData: `@import “src/styles/global.scss”;`
// }
// }
// }
// });

// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue({ 
      template: { transformAssetUrls }
    }),
    vuetify({
      autoImport: true,
    }),
  ],
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
      '.vue',
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'IP/URL',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
    sourcemap: false,
    minify: true,
  }
});
