
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/text': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/ai': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/media': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/api-docs': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
