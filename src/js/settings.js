import { loadPartials } from '/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  loadPartials();
  initializeSettingsToggle();
  const contactForm = document.getElementById('contact-form');
  const contactMessageFeedback = document.getElementById('contact-message-feedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent default form submission

      // Get form values
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const message = document.getElementById('contact-message').value;

      // Basic validation (optional, but good practice)
      if (!name || !email || !message) {
        contactMessageFeedback.textContent = 'Please fill in all fields.';
        contactMessageFeedback.style.color = 'red';
        return;
      }

      // Display feedback message
      contactMessageFeedback.textContent = 'Thank you! We\'ll contact you within 24 hours.';
      contactMessageFeedback.style.color = 'green';

      // Clear the form (optional)
      contactForm.reset();

      // In a real application, you would send the form data to a server here
      // using fetch or XMLHttpRequest.
      console.warn('Form data:', { name, email, message }); // For testing purposes
    });
  } else {
    console.warn('Contact form not found.');
  }
});

export function initializeSettingsToggle() {
  console.warn('Settings toggles initializing...');

  // Get all toggle switches
  const toggles = document.querySelectorAll('.toggle-input');

  if (!toggles.length) {
    console.warn('No toggle switches found');
    return;
  }

  // Initialize each toggle
  toggles.forEach(toggle => {
    // Get saved state from localStorage
    const savedState = localStorage.getItem(toggle.id);

    // Set initial state
    if (savedState !== null) {
      toggle.checked = savedState === 'true';
      applySettingChange(toggle.id, toggle.checked);
    }

    // Add change event listener
    toggle.addEventListener('change', (e) => {
      const settingId = e.target.id;
      const isEnabled = e.target.checked;

      // Save to localStorage
      localStorage.setItem(settingId, isEnabled);

      // Apply the change
      applySettingChange(settingId, isEnabled);

      // Show feedback
      showFeedbackMessage(settingId, isEnabled);

      console.warn(`Toggle changed: ${settingId} = ${isEnabled}`);
    });

    // Make the label clickable
    const label = document.querySelector(`label[for="${toggle.id}"]`);
    if (label) {
      label.addEventListener('click', () => {
        toggle.checked = !toggle.checked;
        toggle.dispatchEvent(new Event('change')); // Use Event instead of CustomEvent
      });
    }
  });
}

function applySettingChange(settingId, isEnabled) {
  console.warn(`Applying setting change: ${settingId} = ${isEnabled}`);

  switch (settingId) {
    case 'dark-mode':
      // Updated dark mode toggle to persist across pages
      document.body.classList.toggle('dark-mode', isEnabled);
      document.documentElement.classList.toggle('dark-mode', isEnabled);
      localStorage.setItem('dark-mode', isEnabled);
      break;

    case 'notifications':
      if (isEnabled && 'Notification' in window) {
        // Request notification permissions
        Notification.requestPermission().then(function(permission) {
          if (permission === 'granted') {
            new Notification('Notifications Enabled', { // Fixed: Corrected the Notification call
              body: 'You will now receive updates about recipes and meal plans',
              icon: '/images/favicon.png'
            });
          } else {
            // If permission denied, revert the toggle
            const toggle = document.getElementById('notifications');
            if (toggle) {
              toggle.checked = false;
              localStorage.setItem('notifications', false);
              showFeedbackMessage('notifications', false);
            }
          }
        });
      } else if (!isEnabled) {
        // Handle case where notifications are disabled
        console.warn('Notifications disabled');
      }
      break;

    case 'email-updates':
      if (isEnabled) {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          // If no email is stored, prompt user
          const email = prompt('Please enter your email address for updates:'); // Fixed: Corrected the prompt call
          if (email) {
            localStorage.setItem('userEmail', email);
            console.warn('Email updates enabled for:', email);
          } else {
            // If user cancels prompt, revert the toggle
            const toggle = document.getElementById('email-updates');
            if (toggle) {
              toggle.checked = false;
              localStorage.setItem('email-updates', false);
              showFeedbackMessage('email-updates', false);
            }
          }
        }
      } else {
        // Handle case where email updates are disabled
        console.warn('Email updates disabled');
      }
      break;

    case 'auto-save':
      if (isEnabled) {
        // Set up auto-save interval (every 30 seconds)
        localStorage.setItem('auto-save-interval', '30000');
        console.warn('Auto-save enabled with 30-second interval');

        // Start auto-save if on recipe page
        if (window.location.pathname.includes('recipe')) {
          startAutoSave();
        }
      } else {
        // Clear auto-save interval
        localStorage.removeItem('auto-save-interval');
        if (window.location.pathname.includes('recipe')) {
          stopAutoSave();
        }
      }
      break;

    default:
      console.warn(`Unknown setting: ${settingId}`);
  }
}

// New function for auto-save functionality
function startAutoSave() {
  const interval = localStorage.getItem('auto-save-interval');
  if (interval) {
    window.autoSaveInterval = setInterval(() => { // Fixed: Corrected the setInterval call

      const recipeData = collectRecipeData(); // You'll need to implement this
      if (recipeData) {
        localStorage.setItem('recipe-auto-save', JSON.stringify(recipeData));
        console.warn('Recipe auto-saved:', new Date().toLocaleTimeString());
      }
    }, parseInt(interval));
  }
}

// New function to stop auto-save
function stopAutoSave() {
  if (window.autoSaveInterval) {
    clearInterval(window.autoSaveInterval); // Fixed: Corrected the clearInterval call
    window.autoSaveInterval = null;
    console.warn('Auto-save disabled');
  }
}

// Mock function for collecting recipe data (implement your own)
function collectRecipeData() {
  // Replace this with your actual recipe data collection logic
  console.warn('collectRecipeData() needs to be implemented!');
  return {
    title: 'Sample Recipe',
    ingredients: ['Ingredient 1', 'Ingredient 2']
  };
}

function showFeedbackMessage(settingId, isEnabled) {
  const toggle = document.getElementById(settingId);
  if (!toggle) {
    console.warn(`Toggle with ID ${settingId} not found`);
    return;
  }

  let feedbackEl = document.getElementById(`${settingId}-feedback`);
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.id = `${settingId}-feedback`;
    feedbackEl.className = 'setting-feedback';

    const parentItem = toggle.closest('.preference-item');
    if (parentItem) {
      parentItem.appendChild(feedbackEl);
    } else {
      console.warn(`Parent item for toggle ${settingId} not found`);
      return;
    }
  }

  const settingName = settingId.replace('-', ' ');
  feedbackEl.textContent = `${settingName} has been ${isEnabled ? 'enabled' : 'disabled'}`;
  feedbackEl.style.color = isEnabled ? '#007A33' : '#C74A00';

  feedbackEl.style.opacity = '1';

  window.setTimeout(() => {
    feedbackEl.style.opacity = '0';
  }, 2000);
}
