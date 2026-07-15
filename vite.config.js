import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'vendor_mui';
            if (id.includes('recharts') || id.includes('d3')) return 'vendor_recharts';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor_react';
            return 'vendor'; // all other package goes here
          }
        }
      }
    }
  }
})
