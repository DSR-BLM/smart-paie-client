import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * SMART-PAIE — Configuration Vite
 *
 * HTTPS local : installez mkcert puis exécutez :
 *   mkcert -install
 *   mkcert localhost 127.0.0.1 ::1
 * Placez localhost.pem et localhost-key.pem dans ./ssl/
 */

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,
    // HTTPS local (commenté si les certificats ne sont pas présents)
    // https: {
    //   key:  fs.readFileSync('./ssl/localhost-key.pem'),
    //   cert: fs.readFileSync('./ssl/localhost.pem'),
    // },
    proxy: {
      "/api": {
        target: "https://localhost:4000",
        changeOrigin: true,
        secure: false, // Accepter les certificats auto-signés en dev
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:    ["react", "react-dom", "react-router-dom"],
          ui:        ["lucide-react", "clsx", "tailwind-merge"],
          query:     ["@tanstack/react-query", "axios"],
          forms:     ["react-hook-form", "zod", "@hookform/resolvers"],
          table:     ["@tanstack/react-table"],
        },
      },
    },
  },
}));
