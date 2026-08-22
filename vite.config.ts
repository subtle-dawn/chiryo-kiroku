import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      registerType: "autoUpdate",
      includeAssets: ["pwa-icon.svg", "pwa-192.png", "pwa-512.png", "apple-touch-icon.png"],
      manifest: {
        name: "\u6cbb\u7642\u8a18\u9332",
        short_name: "\u6cbb\u7642\u8a18\u9332",
        description: "\u75c5\u6c17\u3054\u3068\u306e\u6cbb\u7642\u7d4c\u904e\u3092\u6642\u7cfb\u5217\u3067\u8a18\u9332\u3059\u308b\u500b\u4eba\u7528\u30a2\u30d7\u30ea",
        theme_color: "#f2f2f7",
        background_color: "#f2f2f7",
        display: "standalone",
        orientation: "portrait",
        scope: "./",
        start_url: "./",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico,png,webmanifest}"],
        navigateFallback: "index.html"
      }
    })
  ]
});
