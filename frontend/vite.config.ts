import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// HTTPS local para probar GPS real desde el celular (requiere contexto seguro).
// Se activa solo si existen los certificados generados con scripts/gen-certs.sh
function httpsOptions() {
  const keyPath = path.resolve(__dirname, '..', 'certs', 'dev-key.pem')
  const certPath = path.resolve(__dirname, '..', 'certs', 'dev-cert.pem')
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) return undefined
  return { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Déjalo así, vacío por dentro
  ],
  server: {
    host: true,        // escucha en todas las interfaces
    port: 5173,
    allowedHosts: ['cusco.limpio', '10.204.207.84'],
    https: process.env.HTTPS_DEV === '1' ? httpsOptions() : undefined,
  },
})