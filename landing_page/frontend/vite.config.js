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
      const src = path.resolve(__dirname, '../static/landing_page/react/index.html');
      const dest = path.resolve(__dirname, '../templates/landing_page/index.html');
      
      if (fs.existsSync(src)) {
        if (!fs.existsSync(path.dirname(dest))) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
        }
        fs.copyFileSync(src, dest);
        fs.unlinkSync(src);
      }
    }
  }
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  return {
    plugins: [react(), tailwindcss(), moveIndexHtml()],
    base: isBuild ? '/static/landing_page/react/' : '/',
    server: {
      proxy: {
        '/accounts': 'http://127.0.0.1:8000',
        '/user': 'http://127.0.0.1:8000',
        '/queries': 'http://127.0.0.1:8000',
        '/sponsor': 'http://127.0.0.1:8000',
        '/staff': 'http://127.0.0.1:8000',
      }
    },
    build: {
      outDir: '../static/landing_page/react',
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
  };
});