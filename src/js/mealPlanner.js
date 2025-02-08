// Initialize the meal planner
export function initializeMealPlanner() {
  const mealPlanBody = document.getElementById('meal-plan-body');
  const savedRecipesContainer = document.getElementById('saved-meals-grid'); 
  const clearPlanButton = document.getElementById('clear-plan');
  const shoppingListButton = document.getElementById("generate-shopping-list"); // Ensure button exists
  const clearShoppingListButton = document.getElementById('clear-shopping-list'); // Ensure button exists

  let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
  let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Function to generate the shopping list
  function generateShoppingList() {
    let shoppingList = {};

    // Loop through meal plan and gather ingredients
    Object.values(mealPlan).forEach(meal => {
        Object.values(meal).forEach(mealName => {
            const recipe = savedRecipes.find(r => r.label === mealName);
            if (recipe && Array.isArray(recipe.ingredients)) { // Ensure it's an array
                recipe.ingredients.forEach(ingredient => {
                    let ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.text || JSON.stringify(ingredient);
                    
                    if (shoppingList[ingredientName]) {
                        shoppingList[ingredientName] += 1; // Increase quantity
                    } else {
                        shoppingList[ingredientName] = 1;
                    }
                });
            }
        });
    });

    // Save shopping list to localStorage
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));

    // Redirect to shopping list page
    window.location.href = "/app-pages/shopping-list.html";
}

  // Function to clear the shopping list
  function clearShoppingList() {
      localStorage.removeItem('shoppingList');
      alert("Shopping list cleared!");
  }

  // Attach event listener to the "Generate Shopping List" button
  if (shoppingListButton) {
      shoppingListButton.addEventListener("click", generateShoppingList);
  }

  // Attach event listener to the "Clear Shopping List" button
  if (clearShoppingListButton) {
      clearShoppingListButton.addEventListener("click", clearShoppingList);
  }

  function renderSavedRecipes() {
      savedRecipesContainer.innerHTML = '';

      if (savedRecipes.length === 0) {
          savedRecipesContainer.innerHTML = `<p>No saved recipes yet. Save some recipes first!</p>`;
          return;
      }

      savedRecipes.forEach(recipe => {
          const recipeCard = document.createElement('div');
          recipeCard.classList.add('saved-meal-card');
          recipeCard.innerHTML = `
              <img src="${recipe.image}" alt="${recipe.label}">
              <div class="saved-meal-info">
                  <h3>${recipe.label}</h3>
                  <p>${Math.round(recipe.calories)} calories</p>
                  <div class="saved-meal-actions">
                      <button class="btn-add-meal" data-recipe='${JSON.stringify(recipe)}'>Add to Planner</button>
                      <button class="btn-remove-meal" data-label="${recipe.label}">Remove</button>
                  </div>
              </div>
          `;
          savedRecipesContainer.appendChild(recipeCard);
      });

      document.querySelectorAll('.btn-add-meal').forEach(button => {
          button.addEventListener('click', openMealSelection);
      });

      document.querySelectorAll('.btn-remove-meal').forEach(button => {
          button.addEventListener('click', removeSavedRecipe);
      });
  }

  function removeSavedRecipe(event) {
      const recipeLabel = event.target.dataset.label;
      savedRecipes = savedRecipes.filter(recipe => recipe.label !== recipeLabel);

      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
      renderSavedRecipes();
  }

  function renderMealPlan() {
      mealPlanBody.innerHTML = '';
      days.forEach(day => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${day}</td>
              <td class="meal-slot" data-day="${day}" data-meal="breakfast">${mealPlan[day]?.breakfast || 'Select'}</td>
              <td class="meal-slot" data-day="${day}" data-meal="lunch">${mealPlan[day]?.lunch || 'Select'}</td>
              <td class="meal-slot" data-day="${day}" data-meal="dinner">${mealPlan[day]?.dinner || 'Select'}</td>
              <td class="meal-slot" data-day="${day}" data-meal="snacks">${mealPlan[day]?.snacks || 'Select'}</td>
              <td>${mealPlan[day]?.calories || 0}</td>
          `;
          mealPlanBody.appendChild(row);
      });
  }

  function openMealSelection(event) {
      const recipe = JSON.parse(event.target.dataset.recipe);

      // Create the meal selection modal
      const modal = document.createElement('div');
      modal.classList.add('meal-selection-modal');
      modal.innerHTML = `
          <div class="modal-content">
              <h2>Select a Day & Meal Type</h2>
              <label for="day-select">Select a Day:</label>
              <select id="day-select">
                  ${days.map(day => `<option value="${day}">${day}</option>`).join('')}
              </select>

              <label for="meal-type-select">Select Meal Type:</label>
              <select id="meal-type-select">
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snacks">Snacks</option>
              </select>

              <button id="confirm-add-meal">Add to Planner</button>
              <button id="cancel-add-meal">Cancel</button>
          </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('confirm-add-meal').addEventListener('click', () => addMealToPlanner(recipe, modal));
      document.getElementById('cancel-add-meal').addEventListener('click', () => modal.remove());
  }

  function addMealToPlanner(recipe, modal) {
      const selectedDay = document.getElementById('day-select').value;
      const mealType = document.getElementById('meal-type-select').value;

      mealPlan[selectedDay] = mealPlan[selectedDay] || {};
      mealPlan[selectedDay][mealType] = recipe.label;
      mealPlan[selectedDay].calories = (mealPlan[selectedDay].calories || 0) + Math.round(recipe.calories);

      localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
      modal.remove();
      renderMealPlan();
  }

  function clearMealPlan() {
      localStorage.removeItem('mealPlan');
      mealPlan = {};
      renderMealPlan();
  }

  clearPlanButton.addEventListener('click', clearMealPlan);
  renderSavedRecipes();
  renderMealPlan();
}
