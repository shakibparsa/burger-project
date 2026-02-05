import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "icon-192.png",
        "icon-512.png",
        "splash-ios.png",
        "splash-android.png",
        "offline.html"
      ],

      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg}"],
        cleanupOutdatedCaches: true,
        navigateFallback: "/offline.html"
      },

      manifest: {
        name: "Burger Buben",
        short_name: "Burger Buben",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#ffffff",

        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
})