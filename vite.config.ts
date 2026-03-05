import { defineConfig } from "vite";
import path from "path";
import electron from "vite-plugin-electron/simple";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

const alias = {
  "@": path.resolve(__dirname, "./src"),
  "@electron": path.resolve(__dirname, "./src/electron"),
  "@shared": path.resolve(__dirname, "./src/shared"),
  "@util": path.resolve(__dirname, "./src/util"),
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    electron({
      main: {
        entry: "src/electron/main.ts",
        vite: {
          resolve: {
            alias,
          },
        },
      },
      preload: {
        input: path.join(__dirname, "src/electron/preload.ts"),
        vite: {
          resolve: {
            alias,
          },
        },
      },
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],
  resolve: {
    alias,
  },
});
