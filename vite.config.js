import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";


export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
  root: "src/",
  base: "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        recipeSearch: resolve(__dirname, "src/app-pages/recipe-search.html"),
        // Add partials to the build
        // header: resolve(__dirname, "src/public/partials/header.html"),
        // footer: resolve(__dirname, "src/public/partials/footer.html"),
      },
    },
  },

  server: {
    historyApiFallback: true,
    port: 5173, 
    open: true,
  },

  define: {
    "import.meta.env.VITE_SERVER_URL": JSON.stringify(env.VITE_SERVER_URL),
    "import.meta.env.VITE_SPOONACULAR_API_KEY": JSON.stringify(env.VITE_SPOONACULAR_API_KEY),
    "import.meta.env.VITE_EDAMAM_APP_ID": JSON.stringify(env.VITE_EDAMAM_APP_ID),
    "import.meta.env.VITE_EDAMAM_API_KEY": JSON.stringify(env.VITE_EDAMAM_API_KEY),
  },
  };
});



