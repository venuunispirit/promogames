import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Route-level code splitting already keeps page chunks small;
    // raise the warning threshold since some vendor chunks are legitimately big.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into their own chunks so they can be
        // cached independently and only loaded when actually needed.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          const path = id.replace(/\\/g, '/')
          if (path.includes('/react/') || path.includes('/react-dom/') || path.includes('/react-router')) return 'react-vendor'
          if (path.includes('/three/') || path.includes('@react-three')) return 'three'
          if (path.includes('/gsap/')) return 'gsap'
          if (path.includes('/leaflet/') || path.includes('/react-leaflet/')) return 'leaflet'
          if (path.includes('/recharts/')) return 'recharts'
          if (path.includes('/framer-motion/')) return 'framer-motion'
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
