import { defineConfig } from 'vite'

export default defineConfig({
  base: '/astute-crow/',
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/zenn': {
        target: 'https://zenn-api.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zenn/, '/api')
      }
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
})