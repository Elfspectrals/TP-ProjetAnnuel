// Minimal Vite config without imports to avoid module resolution issues
export default {
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  esbuild: {
    jsx: 'automatic',
  },
}
