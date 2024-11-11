import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import vitePluginString from 'vite-plugin-string';

export default defineConfig({
  plugins: [
    nodePolyfills(),
    react(),
    vitePluginString({
      include: '**/*.md',
    }),
  ],
  publicDir: 'public',
});
