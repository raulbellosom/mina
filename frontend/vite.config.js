import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // Configuración de env parser dinámico desde la carpeta padre
  const envDir = "../";
  const env = loadEnv(mode, envDir, "");
  const blockedFrontendEnv = new Set(["APPWRITE_API_KEY"]);

  const processEnv = {};
  Object.keys(env).forEach((key) => {
    if (key.startsWith("APPWRITE_") && !blockedFrontendEnv.has(key)) {
      processEnv[`import.meta.env.VITE_${key}`] = JSON.stringify(env[key]);
    }
  });

  return {
    envDir,
    define: processEnv,
    plugins: [
      tailwindcss(),
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "MinaFlow",
          short_name: "MinaFlow",
          description: "Sistema operativo para mina de materiales",
          theme_color: "#1e40af",
          background_color: "#0f172a",
          display: "standalone",
          orientation: "any",
          start_url: "/",
          icons: [
            {
              src: "/pwa-192x192.svg",
              sizes: "192x192",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "/pwa-512x512.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/appwrite\.racoondevs\.com\/v1\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60, // 1 hour
                },
              },
            },
          ],
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-radix": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-select",
              "@radix-ui/react-tabs",
              "@radix-ui/react-tooltip",
            ],
            "vendor-motion": ["framer-motion"],
            "vendor-appwrite": ["appwrite"],
          },
        },
      },
    },
  };
});
