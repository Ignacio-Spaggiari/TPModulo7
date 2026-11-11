import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
  },
  build: {
    // Phaser pesa más de 1 MB, así que subimos el límite para no ver el aviso.
    chunkSizeWarningLimit: 1600,
  },
});
