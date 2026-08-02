import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://bitvalser.github.io/strinova-killfeed-generator/
export default defineConfig({
  plugins: [react()],
  base: '/strinova-killfeed-generator/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
