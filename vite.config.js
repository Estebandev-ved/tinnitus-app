import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: './', // Required for Capacitor
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'three': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          'charts': ['recharts'],
          'motion': ['framer-motion'],
          'face-api': ['@vladmandic/face-api'],
          'maps': ['react-simple-maps', 'd3-geo'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js'
  }
})
