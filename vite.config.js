import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Plugin to move index.html into Django's template directory
function moveIndexHtml() {
  return {
    name: 'move-index-html',
    closeBundle() {
      const src = path.resolve(__dirname, 'landing_page/static/landing_page/react/index.html');
      const dest = path.resolve(__dirname, 'landing_page/templates/landing_page/index.html');
      
      // Ensure destination directory exists
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
    outDir: 'landing_page/static/landing_page/react', // Output directly to Django static
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three') || id.includes('@splinetool')) {
              return '3d-engine';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            if (id.includes('gsap')) {
              return 'animations';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});