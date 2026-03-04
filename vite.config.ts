import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf': ['jspdf'],
        },
      },
    },
  },
  resolve: {
    alias: {
      // jspdf imports html2canvas but we only use direct text rendering — stub it out
      'html2canvas': path.resolve(__dirname, 'src/lib/html2canvas-stub.ts'),
    },
  },
})
