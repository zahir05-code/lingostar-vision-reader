import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/lingostar-vision-reader/',
  plugins: [react()],
  build: {
    minify: 'esbuild',
    sourcemap: false,
    target: 'esnext',
    chunkSizeWarningLimit: 2000,
    emptyOutDir: false
  }
})

