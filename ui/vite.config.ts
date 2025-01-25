import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import Unfonts from "unplugin-fonts/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    Unfonts({
      custom: {
        families: [
          {
            name: "Geist Sans",
            src: "./src/assets/fonts/geist/*.woff2",
          },
        ],
      },
    }) as PluginOption,
  ],
  build: {
    outDir: "../server/_ui/build",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
