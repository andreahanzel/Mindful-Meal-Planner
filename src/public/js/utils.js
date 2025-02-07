// utils.js - Vanilla JavaScript utility functions
export async function loadPartials() {
  try {
      // Load the partials using vanilla JavaScript fetch
      const headerResponse = await fetch('/partials/header.html');
      const footerResponse = await fetch('/partials/footer.html');
      
      if (!headerResponse.ok || !footerResponse.ok) {
          throw new Error('Failed to load partials');
      }

      const headerHtml = await headerResponse.text();
      const footerHtml = await footerResponse.text();

      // Insert the partials into the page
      document.getElementById('header').innerHTML = headerHtml;
      document.getElementById('footer').innerHTML = footerHtml;

      // Initialize menu after header is loaded
      window.setTimeout(() => {
          if (typeof window.initializeMenu === 'function') {
              window.initializeMenu();
          }
      }, 100);

  } catch (error) {
      console.error('Error loading partials:', error);
      // Fallback content if loading fails
      document.getElementById('header').innerHTML = `
          <header class="site-header">
              <div class="container">
                  <h1>Mindful Meal Planner</h1>
              </div>
          </header>`;
      document.getElementById('footer').innerHTML = `
          <footer class="site-footer">
              <div class="container">
                  <p>&copy; 2024 Mindful Meal Planner</p>
              </div>
          </footer>`;
  }
}
