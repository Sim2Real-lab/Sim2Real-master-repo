import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// A simple plugin to move index.html into Django's template directory
function moveIndexHtml() {
  return {
    name: 'move-index-html',
    closeBundle() {
      const src = path.resolve(__dirname, '../static/landing_page/react/index.html');
      const dest = path.resolve(__dirname, '../templates/landing_page/index.html');
      
      // Make sure the destination directory exists
      if (!fs.existsSync(path.dirname(dest))) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
      }
      
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), moveIndexHtml()],
  base: '/static/landing_page/react/', // Point to Django's static URL
  build: {
    outDir: '../static/landing_page/react', // Output directly to Django static
    emptyOutDir: true,
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