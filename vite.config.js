import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react'
          }

          if (id.includes('node_modules/recharts')) {
            return 'charts'
          }

          if (id.includes('node_modules/@supabase')) {
            return 'supabase'
          }
        },
      },
    },
  },
})
