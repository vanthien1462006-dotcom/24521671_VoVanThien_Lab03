import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The Express API (server/) listens on PORT from .env. In dev and preview, /api is proxied to it,
// so the client keeps same-origin relative URLs. Override with API_TARGET if the port changes.
const apiTarget = process.env.API_TARGET ?? 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': apiTarget } },
  preview: { proxy: { '/api': apiTarget } },
})
