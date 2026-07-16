import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      // 确保 @hulianui/ui 和 @hulianui/tokens 正确解析到本地源码
      "@hulianui/ui": resolve(__dirname, "../../packages/ui/src"),
      "@hulianui/tokens": resolve(__dirname, "../../packages/tokens/src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5520,
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
