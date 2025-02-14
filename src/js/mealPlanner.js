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
  Object.entries(mealPlan).forEach(([, meals]) => {
      Object.entries(meals).forEach(([mealType, meal]) => {
          if (mealType === 'calories') return; // Skip the calories property
          
          // Find the recipe in savedRecipes using the meal's label
          const recipe = savedRecipes.find(r => r.label === meal.label);
          
          if (recipe && Array.isArray(recipe.ingredients)) {
              recipe.ingredients.forEach(ingredient => {
                  let ingredientName = typeof ingredient === 'string' ? 
                      ingredient : ingredient.text || JSON.stringify(ingredient);
                  
                  if (shoppingList[ingredientName]) {
                      shoppingList[ingredientName] += 1;
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
            <button class="btn-add-meal" data-recipe='${JSON.stringify(recipe).replace(/'/g, "&#39;").replace(/"/g, "&quot;")}'>Add to Planner</button>
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
        <td data-label="Day">${day}</td>
        <td class="meal-slot" data-label="Breakfast" data-day="${day}" data-meal="breakfast">
            ${mealPlan[day]?.breakfast ? `
                <div class="meal-slot-content">
                    <span>${mealPlan[day].breakfast.label}</span>
                </div>` : 'Select'}
        </td>
        <td class="meal-slot" data-label="Lunch" data-day="${day}" data-meal="lunch">
            ${mealPlan[day]?.lunch ? `
                <div class="meal-slot-content">
                    <span>${mealPlan[day].lunch.label}</span>
                </div>` : 'Select'}
        </td>
        <td class="meal-slot" data-label="Dinner" data-day="${day}" data-meal="dinner">
            ${mealPlan[day]?.dinner ? `
                <div class="meal-slot-content">
                    <span>${mealPlan[day].dinner.label}</span>
                </div>` : 'Select'}
        </td>
        <td class="meal-slot" data-label="Snacks" data-day="${day}" data-meal="snacks">
            ${mealPlan[day]?.snacks ? `
                <div class="meal-slot-content">
                    <span>${mealPlan[day].snacks.label}</span>
                </div>` : 'Select'}
        </td>
        <td data-label="Calories">${mealPlan[day]?.calories || 0}</td>
    `;
        mealPlanBody.appendChild(row);
    });
    document.querySelectorAll('.meal-slot').forEach(slot => {
        slot.addEventListener('click', handleMealSlotClick);
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
    mealPlan[selectedDay][mealType] = {
        label: recipe.label,
        calories: recipe.calories,
        image: recipe.image  // Store the image URL
    };
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

  function handleMealSlotClick(event) {
    // Find the closest meal-slot parent element
    const slotElement = event.target.closest('.meal-slot');
    if (!slotElement) return;

    const day = slotElement.dataset.day;
    const mealType = slotElement.dataset.meal;
    
    if (!mealPlan[day]?.[mealType]) return; // Skip if no meal assigned
    
    const modal = document.createElement('div');
    modal.classList.add('meal-selection-modal');
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Modify ${day} ${mealType}</h2>
        <button id="remove-meal">Remove Meal</button>
        <button id="change-meal">Change Meal</button>
        <button id="cancel">Cancel</button>
      </div>
    `;

    document.body.appendChild(modal);
  
    modal.querySelector('#remove-meal').addEventListener('click', () => {
      // Get the meal's calories
      const calories = mealPlan[day][mealType].calories || 0;
      // Subtract calories from day's total
      mealPlan[day].calories -= Math.round(calories);
      // Remove the meal
      delete mealPlan[day][mealType];
      
      // Check if this day has any meals left
      const remainingMeals = ['breakfast', 'lunch', 'dinner', 'snacks'].some(meal => mealPlan[day][meal]);
      if (!remainingMeals) {
          // If no meals left, reset calories to 0
          mealPlan[day].calories = 0;
      }

      localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
      modal.remove();
      renderMealPlan();
  });

  modal.querySelector('#change-meal').addEventListener('click', () => {
      const calories = mealPlan[day][mealType].calories || 0;
      mealPlan[day].calories -= Math.round(calories);
      delete mealPlan[day][mealType];
      
      // Check if this day has any meals left
      const remainingMeals = ['breakfast', 'lunch', 'dinner', 'snacks'].some(meal => mealPlan[day][meal]);
      if (!remainingMeals) {
          mealPlan[day].calories = 0;
      }

      localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
      modal.remove();
      // Reuse existing add meal flow
      const savedMealButtons = document.querySelectorAll('.btn-add-meal');
      if (savedMealButtons.length > 0) {
          savedMealButtons[0].click();
      }
  });

  modal.querySelector('#cancel').addEventListener('click', () => modal.remove());
}

  clearPlanButton.addEventListener('click', clearMealPlan);
  renderSavedRecipes();
  renderMealPlan();
}
