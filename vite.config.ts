import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",   // MUST match your repo name (case sensitive)
  build: {
    outDir: "docs",    // gh-pages deploys from dist
    assetsDir: "",
  },
});

