import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Relative path for local testing without a backend server
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // If the code comes from a third-party library
          if (id.includes('node_modules')) {
            
            // Chunk 1: The heavy 3D stuff
            if (id.includes('three') || id.includes('@react-three') || id.includes('@splinetool')) {
              return '3d-engine';
            }
            
            // Chunk 2: React itself
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            
            // Chunk 3: GSAP Animations
            if (id.includes('gsap')) {
              return 'animations';
            }
            
            // Catch-all for any other small libraries
            return 'vendor';
          }
          // Note: Your actual UI code gets bundled automatically into your main entry chunk
        }
      }
    }
  }
});