import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fallback JavaScript config for deployment
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
})
