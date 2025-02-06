import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/", // Set the root directory
  base: "/", // Base path
  build: {
    outDir: "../dist", // Output folder (moves outside /src)
    emptyOutDir: true, // Clean build before new output
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"), // Main entry point
      },
    },
  },
  server: {
    port: 5173, // Use default Vite port
    open: true, // Automatically open browser on `npm run dev`
  },
});
