import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),

    nodePolyfills({
      include: ["buffer", "stream", "util"],
      globals: {
        Buffer: true,
      },
    }),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.png",
        "pwa-icons/apple-touch-icon-180x180.png",
        "fonts/**/*",
      ],
      manifest: {
        name: "InvoTrack - Invoice & Expense Tracker",
        short_name: "InvoTrack",
        description:
          "Track invoices, expenses, and manage your business finances with InvoTrack.",
        theme_color: "#f97316",
        background_color: "#18181b",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait-primary",
        icons: [
          {
            src: "pwa-icons/icon-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
});