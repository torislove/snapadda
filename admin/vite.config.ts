import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: false
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.toString().replace(/\\/g, '/');
          if (!normalizedId.includes('node_modules')) return;
          const parts = normalizedId.split('node_modules/')[1].split('/');
          if (parts[0].startsWith('@')) {
            return `${parts[0]}/${parts[1]}`;
          }
          return parts[0];
        }
      }
    }
  }
})
