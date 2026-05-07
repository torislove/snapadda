import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SnapAdda Enterprise',
        short_name: 'SnapAdda',
        description: 'Elite Real Estate Discovery',
        theme_color: '#000000',
        background_color: '#050a14',
        display: 'standalone',
        icons: [
          {
            src: 'favicon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
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
