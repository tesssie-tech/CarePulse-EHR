import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'models/model.json', 'models/weights.json'],
      manifest: {
        name: 'CarePulse EHR',
        short_name: 'CarePulse',
        description: 'Offline-first rural diabetic EHR with local TensorFlow.js risk prediction',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // Cache the offline ML model assets on first visit (cache-first)
        runtimeCaching: [
          {
            urlPattern: /\/models\/.+\.(json|bin)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tfjs-model-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true, // This binds to your local network safely without breaking
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
    }
  }
})
