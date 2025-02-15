import { getSimilarRecipes } from './api.js';

// recipeDetails.js
export function initializeRecipeDetails() {
  displayRecipeDetails();
  setupEventListeners();
}

function displayRecipeDetails() {
  const recipe = JSON.parse(localStorage.getItem('selectedRecipe'));
  if (!recipe) {
      window.location.href = '/app-pages/recipe-search.html';
      return;
  }

  updateRecipeHeader(recipe);
  displayIngredients(recipe);
  displayInstructions(recipe);
  displayNutritionInfo(recipe);
  loadSimilarRecipes(recipe.label);
}
// If no recipe ID is found, show an error message
async function loadSimilarRecipes(recipeName) {
  try {
      const recipes = await getSimilarRecipes(recipeName);
      displaySimilarRecipes(recipes);
  } catch (error) {
      console.error('Error loading similar recipes:', error);
      document.getElementById('similar-recipes').innerHTML = 
          '<p>Unable to load similar recipes at this time.</p>';
  }
}

function displaySimilarRecipes(recipes) {
  const container = document.getElementById('similar-recipes');
  if (!recipes || !recipes.length) {
      container.innerHTML = '<p>No similar recipes found</p>';
      return;
  }

  const recipesHTML = recipes.map(recipe => `
      <div class="similar-recipe-card">
          <img src="${recipe.image}" alt="${recipe.title}">
          <div class="similar-recipe-info">
              <h3>${recipe.title}</h3>
              <div class="recipe-meta">
                  <span>${Math.round(recipe.calories || 0)} calories</span>
                  <span>${recipe.readyInMinutes || 'N/A'} mins</span>
              </div>
              <a href="${recipe.sourceUrl}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn-secondary">
                  View Recipe
              </a>
          </div>
      </div>
  `).join('');

  container.innerHTML = recipesHTML;
}
// Update the recipe header with title, calories, time, and servings
function updateRecipeHeader(recipe) {
  document.getElementById('recipe-title').textContent = recipe.label;
  document.getElementById('recipe-calories').textContent = 
      `${Math.round(recipe.calories)} calories`;
  document.getElementById('recipe-time').textContent = 
      recipe.totalTime ? `${recipe.totalTime} mins` : 'Time not specified';
  document.getElementById('recipe-servings').textContent = 
      `Serves ${recipe.yield || 'N/A'}`;

  const recipeImage = document.getElementById('recipe-image');
  recipeImage.src = recipe.image;
  recipeImage.alt = recipe.label;
}

function displayIngredients(recipe) {
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  
  recipe.ingredientLines.forEach(ingredient => {
      const li = document.createElement('li');
      li.textContent = ingredient;
      ingredientsList.appendChild(li);
  });
}
// Display instructions or a link to the original recipe
function displayInstructions(recipe) {
  const instructionsList = document.getElementById('instructions-list');
  
  if (recipe.instructions && recipe.instructions.length > 0) {
      const instructionsHTML = recipe.instructions.map((step, index) => `
          <div class="instruction-step">
              <span class="step-number">${index + 1}</span>
              <p>${step}</p>
          </div>
      `).join('');
      instructionsList.innerHTML = instructionsHTML;
  } else if (recipe.url) {
      instructionsList.innerHTML = `
          <p>For detailed instructions, please visit: 
              <a href="${recipe.url}" target="_blank" rel="noopener noreferrer">
                  Original Recipe Source
              </a>
          </p>
      `;
  } else {
      instructionsList.innerHTML = '<p>Instructions not available for this recipe.</p>';
  }
}
// Display nutrition information with a progress bar
function displayNutritionInfo(recipe) {
  const nutritionInfo = document.getElementById('nutrition-info');
  const nutrients = recipe.totalNutrients;
  
  const mainNutrients = ['ENERC_KCAL', 'FAT', 'CHOCDF', 'PROCNT', 'FIBTG'];
  
  const nutritionHTML = Object.entries(nutrients)
      .filter(([nutrientId]) => mainNutrients.includes(nutrientId))
      .map(([, nutrient]) => `
          <div class="nutrient-item">
              <div class="nutrient-header">
                  <span class="nutrient-label">${nutrient.label}</span>
                  <span class="nutrient-value">
                      ${Math.round(nutrient.quantity)}${nutrient.unit}
                  </span>
              </div>
              <div class="nutrient-bar">
                  <div class="nutrient-fill" style="width: ${Math.min((nutrient.quantity / 100) * 100, 100)}%"></div>
              </div>
          </div>
      `).join('');
  
  nutritionInfo.innerHTML = nutritionHTML;
}
// Set up event listeners for the save button
function setupEventListeners() {
  const saveButton = document.getElementById('save-recipe');
  saveButton.addEventListener('click', handleSaveRecipe);
}
// Save the recipe to localStorage
function handleSaveRecipe() {
  const recipe = JSON.parse(localStorage.getItem('selectedRecipe'));
  let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
  
  // Check if recipe is already saved
  const isAlreadySaved = savedRecipes.some(saved => saved.label === recipe.label);
  
  if (!isAlreadySaved) {
      savedRecipes.push(recipe);
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
      alert('Recipe saved successfully!');
  } else {
      alert('This recipe is already saved!');
  }
}
