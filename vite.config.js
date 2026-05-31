import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so it works on Vercel, Netlify,
// and GitHub Pages (which serves from a /repo-name/ subpath) alike.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
