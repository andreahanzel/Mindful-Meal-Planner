import { loadPartials } from '/js/utils.js';
import { checkAuthState } from '/js/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication first before doing anything else
  if (!checkAuthState()) {
    window.location.href = '/app-pages/login.html';
    return;
  }

  loadPartials();
  initializeSettingsToggle();
  initializeWelcomeMessage();
  initializeContactForm();
});

// Initialize the welcome message
function initializeWelcomeMessage() {
  if (!checkAuthState()) {
    window.location.href = '/app-pages/login.html';
    return;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const welcomeMessage = document.getElementById('welcome-message');
  if (welcomeMessage && user) {
    welcomeMessage.textContent = `Welcome, ${user.name || 'User'}!`;
  }
}
// Initialize the contact form
function initializeContactForm() {
  if (!checkAuthState()) {
    window.location.href = '/app-pages/login.html';
    return;
  }

  const contactForm = document.getElementById('contact-form');
  const contactMessageFeedback = document.getElementById('contact-message-feedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const message = document.getElementById('contact-message').value;

      if (!name || !email || !message) {
        contactMessageFeedback.textContent = 'Please fill in all fields.';
        contactMessageFeedback.style.color = 'red';
        return;
      }

      contactMessageFeedback.textContent = 'Thank you! We\'ll contact you within 24 hours.';
      contactMessageFeedback.style.color = 'green';
      contactForm.reset();

      console.warn('Form data:', { name, email, message });
    });
  }
}
// Initialize the settings toggle
export function initializeSettingsToggle() {
  if (!checkAuthState()) {
    window.location.href = '/app-pages/login.html';
    return;
  }

  console.warn('Settings toggles initializing...');

  const user = JSON.parse(localStorage.getItem('user'));
  const userSettingsKey = `userSettings_${user.email}`;
  let userSettings = JSON.parse(localStorage.getItem(userSettingsKey));

  if (!userSettings) {
    // Initialize with default settings if none exist
    userSettings = {
      darkMode: false,
      notifications: false,
      emailUpdates: false,
      autoSave: false,
    };
    localStorage.setItem(userSettingsKey, JSON.stringify(userSettings));
  }

  const toggles = document.querySelectorAll('.toggle-input');

  if (!toggles.length) {
    console.warn('No toggle switches found');
    return;
  }

  toggles.forEach(toggle => {
    const toggleId = toggle.id; // Renamed to avoid shadowing
    const savedState = userSettings[toggleId];

    if (savedState !== undefined) {
      toggle.checked = savedState;
      applySettingChange(toggleId, savedState);
    }

    toggle.addEventListener('change', (e) => {
      const changedToggleId = e.target.id; // Renamed to avoid shadowing
      const isEnabled = e.target.checked;

      // Update user settings in localStorage
      userSettings[changedToggleId] = isEnabled;
      localStorage.setItem(userSettingsKey, JSON.stringify(userSettings));

      applySettingChange(changedToggleId, isEnabled);
      showFeedbackMessage(changedToggleId, isEnabled);

      console.warn(`Toggle changed: ${changedToggleId} = ${isEnabled}`);
    });
  });
}

// Function to apply setting changes
function applySettingChange(settingId, isEnabled) {
  console.warn(`Applying setting change: ${settingId} = ${isEnabled}`);

  switch (settingId) {
    case 'dark-mode':
      document.body.classList.toggle('dark-mode', isEnabled);
      document.documentElement.classList.toggle('dark-mode', isEnabled);
      localStorage.setItem('dark-mode', isEnabled);
      break;

    // In applySettingChange function, update the notifications case
case 'notifications':
  if (isEnabled) {
    if ('Notification' in window) {
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          // Show a test notification
          new Notification('Notifications Enabled', {
            body: 'You will now receive recipe and meal plan updates',
            icon: '/images/favicon.png'
          });
        } else {
          // If permission denied, turn off the toggle
          const toggle = document.getElementById('notifications');
          if (toggle) {
            toggle.checked = false;
          }
          alert('Please enable notifications in your browser settings to use this feature.');
        }
      });
    } else {
      alert('Your browser does not support notifications');
      const toggle = document.getElementById('notifications');
      if (toggle) {
        toggle.checked = false;
      }
    }
  }
  break;

    case 'email-updates':
      if (isEnabled) {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          const email = prompt('Please enter your email address for updates:');
          if (email) {
            localStorage.setItem('userEmail', email);
            console.warn('Email updates enabled for:', email);
          } else {
            const toggle = document.getElementById('email-updates');
            if (toggle) {
              toggle.checked = false;
              localStorage.setItem('email-updates', false);
              showFeedbackMessage('email-updates', false);
            }
          }
        }
      }
      break;

    case 'auto-save':
      if (isEnabled) {
        localStorage.setItem('auto-save-interval', '30000');
        console.warn('Auto-save enabled with 30-second interval');
        if (window.location.pathname.includes('recipe')) {
          startAutoSave();
        }
      } else {
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
// Function to start auto-saving
function startAutoSave() {
  const interval = localStorage.getItem('auto-save-interval');
  if (interval) {
    window.autoSaveInterval = setInterval(() => {
      const recipeData = collectRecipeData();
      if (recipeData) {
        localStorage.setItem('recipe-auto-save', JSON.stringify(recipeData));
        console.warn('Recipe auto-saved:', new Date().toLocaleTimeString());
      }
    }, parseInt(interval));
  }
}
// Function to stop auto-saving
function stopAutoSave() {
  if (window.autoSaveInterval) {
    clearInterval(window.autoSaveInterval);
    window.autoSaveInterval = null;
    console.warn('Auto-save disabled');
  }
}
// Function to collect recipe data (placeholder)
function collectRecipeData() {
  console.warn('collectRecipeData() needs to be implemented!');
  return {
    title: 'Sample Recipe',
    ingredients: ['Ingredient 1', 'Ingredient 2']
  };
}
// Function to show feedback message
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

  const isDarkMode = document.body.classList.contains('dark-mode');
  feedbackEl.style.color = isDarkMode ? '#FFFFFF' : '#000000';

  feedbackEl.style.opacity = '1';

  window.setTimeout(() => {
    feedbackEl.style.opacity = '0';
  }, 2000);
}
