import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // shortcut: lets any *.trycloudflare.com tunnel reach `vite preview` for phone tests, remove once the app is deployed
  preview: { allowedHosts: ['.trycloudflare.com'] },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Life RPG',
        short_name: 'Life RPG',
        description: 'Daily quests, XP and ranks for real life.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0b0714',
        background_color: '#0b0714',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
