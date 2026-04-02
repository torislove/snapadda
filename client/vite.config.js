import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Essential Core Bundle (React + Router)
          if (id.includes('react') || id.includes('scheduler') || id.includes('react-router')) {
            return 'vendor-core';
          }

          // Isolated Large Libraries (High impact on performance)
          if (id.includes('firebase')) return 'vendor-firebase';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-viz';

          // Let Rollup handle everything else dynamically to prevent circular dependencies
        }
      }
    }
  }
})
