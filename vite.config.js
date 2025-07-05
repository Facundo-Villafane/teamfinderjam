import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  // Configuración para GitHub Pages
  base: '/teamfinderjam/', // Reemplaza 'teamfinder' con el nombre de tu repositorio
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
