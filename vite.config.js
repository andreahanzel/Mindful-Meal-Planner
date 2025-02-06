import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/", 
  base: "/", 
  build: {
    outDir: "../dist", 
    emptyOutDir: true, 
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        recipeSearch: resolve(__dirname, "src/app-pages/recipe-search.html"),
        recipeDetails: resolve(__dirname, "src/app-pages/recipe-details.html"),
        mealPlanner: resolve(__dirname, "src/app-pages/meal-planner.html"),
        shoppingList: resolve(__dirname, "src/app-pages/shopping-list.html"),
        settings: resolve(__dirname, "src/app-pages/settings.html"),
      },
    },
  },

  server: {
    historyApiFallback: true, 
  },
});
