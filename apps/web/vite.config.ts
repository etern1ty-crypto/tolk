import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    // cloudflared / trycloudflare.com demos
    allowedHosts: true,
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:3000',
        ws: true,
        changeOrigin: true,
      },
      '^/(auth|chats|posts|me|media|users|wall|blocks|reports|sessions)': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    allowedHosts: true,
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:3000',
        ws: true,
        changeOrigin: true,
      },
      '^/(auth|chats|posts|me|media|users|wall|blocks|reports|sessions)': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
