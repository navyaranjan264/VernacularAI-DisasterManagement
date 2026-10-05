import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/hf-api': {
        target: 'https://router.huggingface.co',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/hf-api/, ''),
      },
      '/tts-proxy': {
        target: 'https://translate.google.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/tts-proxy/, '/translate_tts'),
        headers: {
          'Referer': 'https://translate.google.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192x192.png', 'icon-512x512.png'],
      // Override the strict 2MB default sizing limit to allow Vercel to cache heavy WASM pipelines offline
      workbox: {
        maximumFileSizeToCacheInBytes: 35000000 // 35 MiB
      },
      manifest: {
        name: 'SAHAYai — Emergency Operations System',
        short_name: 'SAHAYai',
        description: 'National disaster management and emergency operations system with offline support',
        theme_color: '#14273E',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
