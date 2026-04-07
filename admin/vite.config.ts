import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'https://snapadda-7a6e6.web.app',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1200,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // React Core
          if (id.includes('react') || id.includes('scheduler') || id.includes('react-router')) {
            return 'vendor-core';
          }

          // UI & Icons
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('lucide-react')) return 'vendor-icons';

          // Utils
          if (id.includes('i18next') || id.includes('jwt-decode')) return 'vendor-utils';

          // Let Rollup handle everything else dynamically to prevent circular dependencies
        }
      }
    }
  }
})
