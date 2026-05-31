import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During dev, /api/* is proxied to the local Gemini proxy server (port 8787)
// so the API key never ships to the browser.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
});
