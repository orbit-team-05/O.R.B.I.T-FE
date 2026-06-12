import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/api": {
        target: "http://98.86.116.216:8080",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://98.86.116.216:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});