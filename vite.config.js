
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  // Configuración
  base: '/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  // Configuración para SPA - manejar rutas del lado del cliente
  server: {
    historyApiFallback: true
  },
  preview: {
    historyApiFallback: true
  }
})
