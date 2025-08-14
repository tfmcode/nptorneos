// vite.config.ts o vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Servís desde el root del dominio → base absoluta
  // (si lo servís bajo un subpath, ej. /webapp/, usá base: '/webapp/')
  base: "/",
  server: {
    port: Number(process.env.PORT) || 5173,
    host: "0.0.0.0",
    // Si querés evitar setear VITE_API_URL en dev, podés usar proxy:
    // proxy: { '/api': { target: 'http://localhost:5001', changeOrigin: true } }
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
});
