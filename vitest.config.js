import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Share Unity',
        short_name: 'ShareUnity',
        description: 'Share Unity Community Platform',
        theme_color: '#0f0f14',
        icons: []
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.config.js'
      ]
    }
  }
});
