import { defineConfig } from 'vite'

export default defineConfig({
  base: '/astute-crow/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
})