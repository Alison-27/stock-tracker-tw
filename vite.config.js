import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/stock-tracker-tw/',
  server: {
    port: 3000,
    proxy: {
      '/api/finmind': {
        target: 'https://api.finmindtrade.com/api/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/finmind/, '')
      },
      '/api/twse': {
        target: 'https://openapi.twse.com.tw/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twse/, '')
      },
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, '')
      }
    }
  }
})
