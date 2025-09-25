import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      // Force Rollup to use JS implementation instead of native binary
      external: [],
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    // Force Rollup to skip native modules
    'process.env.ROLLUP_SKIP_NODEJS_NATIVE': 'true',
    'process.env.ROLLUP_USE_NODEJS_NATIVE': 'false'
  }
})
