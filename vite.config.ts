import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.jpg", "offline.html", "manifest.json", "browserconfig.xml"],
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/_/, /\.[a-z0-9]+(\?.*)?$/i],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\.(js|css|woff2?|ttf|eot|otf|png|jpg|jpeg|gif|svg|ico|webp|avif)$/i,
            handler: "CacheFirst",
            options: { cacheName: "flowtracker-static", expiration: { maxEntries: 80 } },
          },
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "flowtracker-pages",
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: true },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Ensure the build doesn't fail on warnings if that was happening
    reportCompressedSize: true,
  },
}));
