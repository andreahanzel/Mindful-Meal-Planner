export function initializeShoppingList() {
  const shoppingListContainer = document.getElementById('shopping-list');
  const clearShoppingListButton = document.getElementById('clear-shopping-list');

  let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || {};

  function renderShoppingList() {
      shoppingListContainer.innerHTML = '';

      if (Object.keys(shoppingList).length === 0) {
          shoppingListContainer.innerHTML = '<p>Your shopping list is empty.</p>';
          return;
      }

      Object.entries(shoppingList).forEach(([ingredient, quantity]) => {
          // Ensure proper display
          let itemText = typeof ingredient === 'string' ? ingredient : JSON.stringify(ingredient);

          const li = document.createElement('li');
          li.textContent = `${itemText} (x${quantity})`; 
          shoppingListContainer.appendChild(li);
      });
  }

  function clearShoppingList() {
      localStorage.removeItem('shoppingList');
      shoppingList = {};
      renderShoppingList();
  }

  if (clearShoppingListButton) {
      clearShoppingListButton.addEventListener("click", clearShoppingList);
  }

  renderShoppingList();
}
