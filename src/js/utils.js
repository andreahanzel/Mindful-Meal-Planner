import { initializeMenu } from './menu.js';
import { initializeFooterNewsletter } from './footernewsletter.js';
import { updateHeader } from './auth.js'; 


// Dark mode check function to apply across all pages
export function checkDarkMode() {
  const isDarkMode = localStorage.getItem('dark-mode') === 'true';
  if (isDarkMode) {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
  }
}


// Function to show feedback message
export async function loadPartials() {
  try {
    checkDarkMode();
    const headerResponse = await fetch('/partials/header.html');
    const footerResponse = await fetch('/partials/footer.html');

    if (!headerResponse.ok || !footerResponse.ok) {
      throw new Error('Failed to load partials');
    }

    const headerHtml = await headerResponse.text();
    const footerHtml = await footerResponse.text();

    document.getElementById('header').innerHTML = headerHtml;
    document.getElementById('footer').innerHTML = footerHtml;

    console.warn("Partials loaded successfully!");

    // Call updateHeader after the header is loaded
    updateHeader();

    // Initialize menu and footer newsletter after partials are loaded
    window.setTimeout(() => {
      initializeMenu();
      initializeFooterNewsletter();
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
          <p>&copy; 2025 Mindful Meal Planner</p>
        </div>
      </footer>`;
  }
}
