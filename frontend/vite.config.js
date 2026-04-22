import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // host: '0.0.0.0',
    // port: 80,
    strictPort: true, // Evita que Vite intente usar otro puerto si el 80 está "ocupado"
    allowedHosts: true // <--- CAMBIO CLAVE: Permite CUALQUIER host
  },
  preview: {
    host: '0.0.0.0',
    port: 80,
    strictPort: true,
    allowedHosts: true // <--- CAMBIO CLAVE: Permite CUALQUIER host
  }
})
