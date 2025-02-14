export function initializeShoppingList() {
  const shoppingListContainer = document.getElementById('shopping-list');
  const clearShoppingListButton = document.getElementById('clear-shopping-list');
  const emailButton = document.getElementById('email-shopping-list');
  const downloadButton = document.getElementById('download-pdf');

  let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || {};

  function renderShoppingList() {
    shoppingListContainer.innerHTML = '';

    if (Object.keys(shoppingList).length === 0) {
      shoppingListContainer.innerHTML = '<p>Your shopping list is empty.</p>';
      return;
    }

    Object.entries(shoppingList).forEach(([ingredient, quantity]) => {
      let itemText = typeof ingredient === 'string' ? ingredient : JSON.stringify(ingredient);

      const li = document.createElement('li');
      li.className = 'shopping-list-item';
      li.innerHTML = `
        <span class="item-text">${itemText}</span>
        <div class="item-controls">
          <button class="quantity-btn minus">-</button>
          <span class="quantity">${quantity}</span>
          <button class="quantity-btn plus">+</button>
          <button class="remove-item">×</button>
        </div>
      `;

      const minusBtn = li.querySelector('.minus');
      const plusBtn = li.querySelector('.plus');
      const removeBtn = li.querySelector('.remove-item');
      const quantitySpan = li.querySelector('.quantity');

      minusBtn.addEventListener('click', () => {
        if (shoppingList[ingredient] > 1) {
          shoppingList[ingredient]--;
          quantitySpan.textContent = shoppingList[ingredient];
          localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        }
      });

      plusBtn.addEventListener('click', () => {
        shoppingList[ingredient]++;
        quantitySpan.textContent = shoppingList[ingredient];
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
      });

      removeBtn.addEventListener('click', () => {
        delete shoppingList[ingredient];
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        renderShoppingList();
      });

      shoppingListContainer.appendChild(li);
    });
  }

  function clearShoppingList() {
    localStorage.removeItem('shoppingList');
    shoppingList = {};
    renderShoppingList();
  }

  function createAndDownloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set margins and page width
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const maxWidth = pageWidth - (margin * 2);
    
    // Add title
    doc.setFontSize(20);
    doc.text('Shopping List', margin, margin);
    
    // Add subtitle
    doc.setFontSize(12);
    doc.text('Mindful Meal Planner', margin, margin + 10);
    
    let yPosition = margin + 25;
    
    // Add items with proper text wrapping
    doc.setFontSize(12);
    Object.entries(shoppingList).forEach(([ingredient, quantity]) => {
        // Format the item text
        let itemText = `• ${ingredient}: ${quantity}`;
        
        // Split text into lines that fit within the page width
        const lines = doc.splitTextToSize(itemText, maxWidth);
        
        // Check if we need to add a new page
        if (yPosition + (lines.length * 7) > doc.internal.pageSize.height - margin) {
            doc.addPage();
            yPosition = margin;
        }
        
        // Add each line of text
        lines.forEach(line => {
            doc.text(line, margin, yPosition);
            yPosition += 7;
        });
        
        // Add some spacing between items
        yPosition += 3;
    });

    return doc;
}

  function downloadPDF() {
    const doc = createAndDownloadPDF();
    doc.save('shopping-list.pdf');
  }

  function emailShoppingList() {
    let emailContent = 'Shopping List:\n\n';
    Object.entries(shoppingList).forEach(([ingredient, quantity]) => {
      emailContent += `${ingredient}: ${quantity}\n`;
    });

    const gmailComposeUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&su=${encodeURIComponent('My Shopping List')}&body=${encodeURIComponent(emailContent)}`;
    window.open(gmailComposeUrl, '_blank');
  }

  // Add event listeners
  if (clearShoppingListButton) {
    clearShoppingListButton.addEventListener("click", clearShoppingList);
  }

  if (emailButton) {
    emailButton.addEventListener("click", emailShoppingList);
  }

  if (downloadButton) {
    downloadButton.addEventListener("click", downloadPDF);
  }

  renderShoppingList();
}
