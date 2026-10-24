import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        '**/design/**',
        '**/scripts/**',
        '**/.git/**',
        '**/public/**',
        '**/*.png',
        '**/*.jpg',
        '**/*.jpeg',
        '**/*.webp',
        '**/*.gif',
        '**/*.pdf',
        '**/*.json',
      ],
    },
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion': ['framer-motion'],
          'three': ['three'],
          'gsap': ['gsap'],
        }
      }
    }
  }
});
