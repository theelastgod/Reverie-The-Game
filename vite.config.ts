import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: process.env.VITE_BASE || "/",
  publicDir: "public",
  server: {
    port: 5175,
    host: "127.0.0.1",
    proxy: {
      "/ws": { target: "http://127.0.0.1:8788", ws: true },
      "/session": { target: "http://127.0.0.1:8788" },
      "/world": { target: "http://127.0.0.1:8788" },
    },
  },
  build: { outDir: "dist", emptyOutDir: true },
});
