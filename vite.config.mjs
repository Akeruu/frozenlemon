import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "/frozenlemon/",
  plugins: [],
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(rootDir, "index.html"),
        podcast: resolve(rootDir, "podcast/index.html"),
        photo: resolve(rootDir, "photo/index.html"),
        meme: resolve(rootDir, "meme/index.html"),
        blog: resolve(rootDir, "blog/index.html"),
        about: resolve(rootDir, "about/index.html"),
        archive: resolve(rootDir, "archive/index.html"),
        blueVeil: resolve(rootDir, "blog/blue-veil/index.html"),
        bodyMemory: resolve(rootDir, "blog/body-memory/index.html"),
        helloChris: resolve(rootDir, "blog/hello-chrislee/index.html")
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
