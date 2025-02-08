// api.js
const EDAMAM_APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const EDAMAM_API_KEY = import.meta.env.VITE_EDAMAM_API_KEY;
const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

console.warn('Environment Variables:', {
    EDAMAM_APP_ID,
    EDAMAM_API_KEY
});

console.warn("Spoonacular API Key:", import.meta.env.VITE_SPOONACULAR_API_KEY);

export async function searchRecipes(query, diet = '') {
    try {
        console.warn('API Credentials:', {
            appId: EDAMAM_APP_ID,
            appKey: EDAMAM_API_KEY
        });

        const baseUrl = 'https://api.edamam.com/api/recipes/v2';
        let url = `${baseUrl}?type=public&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_API_KEY}&q=${query}`;
        
        if (diet) {
            url += `&health=${diet}`;
        }

        console.warn('Fetching from URL:', url.toString());

        // Add headers for authentication
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Edamam-Account-User': 'andreatoreki'
            }
        });

        if (!response.ok) {
            console.error('Response status:', response.status);
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`API Error: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        console.warn('API Response:', data);
        return data.hits;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        throw error;
    }
}

export function initializeRecipeSearch() {
    const searchInput = document.getElementById('recipe-search');
    const searchButton = document.getElementById('search-button');
    const dietFilter = document.getElementById('diet-filter');
    const resultsContainer = document.getElementById('recipe-results');
    const loadingSpinner = document.getElementById('loading');

    async function handleSearch() {
        try {
            const query = searchInput.value.trim();
            const diet = dietFilter.value;

            console.warn('Starting search with:', { query, diet });
            console.warn('Environment variables:', {
                appId: import.meta.env.VITE_EDAMAM_APP_ID,
                appKey: import.meta.env.VITE_EDAMAM_API_KEY
            });

            if (!query) {
                resultsContainer.innerHTML = '<p>Please enter a search term</p>';
                return;
            }

            // Show loading state
            loadingSpinner.style.display = 'block';
            resultsContainer.innerHTML = '';

            const recipes = await searchRecipes(query, diet);
            displayRecipes(recipes);
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <p class="error">Error fetching recipes: ${error.message}</p>
                <p>Please try again in a moment.</p>
            `;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    function displayRecipes(recipes) {
        if (!recipes || !recipes.length) {
            resultsContainer.innerHTML = '<p>No recipes found. Try different keywords.</p>';
            return;
        }

        const recipeHTML = recipes.map(recipe => `
            <div class="recipe-card">
                <img src="${recipe.recipe.image}" alt="${recipe.recipe.label}">
                <div class="recipe-info">
                    <h3>${recipe.recipe.label}</h3>
                    <p>${Math.round(recipe.recipe.calories)} calories</p>
                    <div class="recipe-details">
                        <p>Cuisine: ${recipe.recipe.cuisineType || 'Not specified'}</p>
                        <p>Meal Type: ${recipe.recipe.mealType || 'Not specified'}</p>
                    </div>
                    <button class="btn-secondary view-recipe" 
                            data-recipe-id="${encodeURIComponent(JSON.stringify(recipe.recipe))}">
                        View Recipe
                    </button>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = recipeHTML;

        // Add event listeners to recipe cards
        document.querySelectorAll('.view-recipe').forEach(button => {
            button.addEventListener('click', () => {
                try {
                    const recipe = JSON.parse(decodeURIComponent(button.dataset.recipeId));
                    // Store recipe details in localStorage for the details page
                    localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                    window.location.href = '/app-pages/recipe-details.html';
                } catch (error) {
                    console.error('Error handling recipe click:', error);
                }
            });
        });
    }

    // Event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    dietFilter.addEventListener('change', handleSearch);

    // Initial check for API credentials
    if (!EDAMAM_APP_ID || !EDAMAM_API_KEY) {
        console.error('API credentials are missing');
        resultsContainer.innerHTML = '<p class="error">API configuration error. Please check your environment variables.</p>';
    }
}


// Similar Recipes
export async function getSimilarRecipes(recipeName) {
  try {
      console.warn("🔹 Spoonacular API call started with:", { query: recipeName });

      const keywords = recipeName.split(" "); // Get words from recipe name
      let searchQuery = recipeName; 

      let searchData = null;
      let recipeId = null;

      for (let i = 0; i < keywords.length; i++) {
          console.warn(`🔄 Trying search with: ${searchQuery}`);
          
          const searchResponse = await fetch(
              `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(searchQuery)}&number=1&apiKey=${SPOONACULAR_API_KEY}`
          );

          searchData = await searchResponse.json();
          console.warn("🔹 Search API Response:", searchData);

          if (searchData.results && searchData.results.length > 0) {
              recipeId = searchData.results[0].id;
              console.warn("✅ Found Recipe ID:", recipeId);
              break;
          }

          searchQuery = keywords[0];
      }

      if (!recipeId) {
          console.warn("⚠️ No valid recipe ID found. Cannot fetch similar recipes.");
          return [];
      }

      // 🔹 Step 2: Get Similar Recipes
      const response = await fetch(
          `https://api.spoonacular.com/recipes/${recipeId}/similar?number=3&apiKey=${SPOONACULAR_API_KEY}`
      );

      const similarRecipes = await response.json();
      console.warn("🔹 Similar Recipes API Response:", similarRecipes);

      if (!similarRecipes || similarRecipes.length === 0) {
          console.warn("⚠️ No similar recipes found.");
          return [];
      }

      // 🔹 Step 3: Fetch images & calories for each similar recipe
      const recipesWithDetails = await Promise.all(similarRecipes.map(async (recipe) => {
          const detailsResponse = await fetch(
              `https://api.spoonacular.com/recipes/${recipe.id}/information?includeNutrition=true&apiKey=${SPOONACULAR_API_KEY}`
          );

          if (!detailsResponse.ok) {
              console.warn(`⚠️ Failed to fetch details for recipe ID: ${recipe.id}`);
              return { ...recipe, image: "", calories: "N/A" };
          }

          const detailsData = await detailsResponse.json();
          return { 
              ...recipe, 
              image: detailsData.image || "", 
              calories: detailsData.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || "N/A"
          };
      }));

      console.warn("✅ Final Recipes with Images & Calories:", recipesWithDetails);
      return recipesWithDetails;

  } catch (error) {
      console.error("🚨 Error fetching similar recipes:", error);
      throw error;
  }
}
