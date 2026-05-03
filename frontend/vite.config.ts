import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    // nodePolyfills(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    {
      name: 'markdown-loader',
      transform(code, id) {
        if (id.slice(-3) === '.md') {
          // For .md files, get the raw content
          return `export default ${JSON.stringify(code)};`;
        }
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/api/, ''),
      },
      '/static': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/static/, ''),
      },
    },
  },
  publicDir: 'public',
});
