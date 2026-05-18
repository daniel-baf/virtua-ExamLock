import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@app': new URL('./src/app', import.meta.url).pathname,
      '@shared': new URL('./src/shared', import.meta.url).pathname,
      '@domains': new URL('./src/domains', import.meta.url).pathname,
      '@auth': new URL('./src/domains/auth', import.meta.url).pathname,
      '@sessions': new URL('./src/domains/sessions', import.meta.url).pathname,
      '@monitoring': new URL('./src/domains/monitoring', import.meta.url).pathname,
      '@users': new URL('./src/domains/users', import.meta.url).pathname,
      '@admin': new URL('./src/domains/admin', import.meta.url).pathname,
      '@audit': new URL('./src/domains/audit', import.meta.url).pathname,
    },
  },
})
