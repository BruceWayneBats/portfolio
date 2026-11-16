import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const pages = ["remont", "barber", "shop", "glamping"];

export default defineConfig({
  // GitHub Pages: сайт лежит в подпапке /portfolio/
  base: process.env.BASE ?? "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        ...Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, p, "index.html")])),
      },
    },
  },
});
