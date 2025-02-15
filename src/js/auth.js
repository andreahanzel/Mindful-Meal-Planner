// Default settings for a user
const DEFAULT_USER_SETTINGS = {
  darkMode: false,
  notifications: false,
  emailUpdates: false,
  autoSave: false,
};

export function initializeAuth() {
  console.warn("Initializing auth...");
  
  if (window.location.pathname.includes('login.html')) {
    localStorage.removeItem('user');
    console.warn("Removed user from localStorage on login page");
  }

  const signUpButton = document.getElementById('signUp');
  const signInButton = document.getElementById('signIn');
  const container = document.querySelector('.auth-forms');
  const loginForm = document.querySelector('#login-form');
  const signupForm = document.querySelector('#signup-form');

  // Ensure forms exist before adding event listeners
  if (!loginForm || !signupForm) {
    console.warn("Login or signup form not found");
    return;
  }

  const signInContainer = document.querySelector('.sign-in-container');
  const signUpContainer = document.querySelector('.sign-up-container');

  if (signUpButton) {
    signUpButton.addEventListener('click', () => {
      container.classList.add("right-panel-active");
      // Use visibility instead of display
      if (signInContainer) signInContainer.style.visibility = "hidden";
      if (signUpContainer) {
        signUpContainer.style.visibility = "visible";
        signUpContainer.style.display = "flex";
      }
    });
  }

  if (signInButton) {
    signInButton.addEventListener('click', () => {
      container.classList.remove("right-panel-active");
      // Use visibility instead of display
      if (signUpContainer) signUpContainer.style.visibility = "hidden";
      if (signInContainer) {
        signInContainer.style.visibility = "visible";
        signInContainer.style.display = "flex";
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // Initial state setup
  if (signInContainer) signInContainer.style.display = "flex";
  if (signUpContainer) signUpContainer.style.display = "none";

  console.warn("Auth initialization complete");
}

export function updateHeader() {
  console.warn("Updating header...");
  const user = JSON.parse(localStorage.getItem('user'));
  const authButton = document.getElementById('auth-button');
  const logoutButton = document.getElementById('logout-button');
  const userGreeting = document.getElementById('user-greeting');

  if (!authButton || !logoutButton || !userGreeting) {
    console.warn("One or more header elements not found in the DOM.");
    return;
  }

  if (user && user.isLoggedIn) {
    userGreeting.textContent = `Hello, ${user.name || 'User'}`;
    userGreeting.style.display = 'inline-block';
    authButton.style.display = 'none';
    logoutButton.style.display = 'inline-block';

    // Reattach the logout button event listener
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  } else {
    userGreeting.style.display = 'none';
    authButton.textContent = "Sign Up / Login";
    authButton.href = "/app-pages/login.html";
    authButton.style.display = 'inline-block';
    logoutButton.style.display = 'none';
  }
}

// Function to handle login
async function handleLogin(e) {
  e.preventDefault();
  console.warn("Handling login...");

  const email = e.target.querySelector('input[name="email"]').value;
  const password = e.target.querySelector('input[name="password"]').value;

  try {
    const storedUser = JSON.parse(localStorage.getItem('registeredUser'));
    
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      console.warn("Login successful with stored user");
      loginSuccess(storedUser);
      return;
    }

    const response = await fetch('/data/users.json');
    const users = await response.json();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      console.warn("Login successful with JSON user");
      loginSuccess(user);
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert("Login failed: " + (error.message || "Invalid email or password"));
  }
}

async function handleSignup(e) {
  e.preventDefault();
  console.warn("Handling signup...");

  const name = e.target.querySelector('input[name="name"]').value;
  const email = e.target.querySelector('input[name="email"]').value;
  const password = e.target.querySelector('input[name="password"]').value;

  try {
    const storedUser = JSON.parse(localStorage.getItem('registeredUser'));
    if (storedUser && storedUser.email === email) {
      throw new Error('Email already registered');
    }

    const newUser = { name, email, password };
    localStorage.setItem('registeredUser', JSON.stringify(newUser));
    console.warn("New user registered:", newUser);
    
    loginSuccess(newUser);
  } catch (error) {
    console.error("Signup failed:", error);
    alert("Signup failed: " + error.message);
  }
}


function loginSuccess(user) {
  console.warn("Login success, setting user data");

  // Load or initialize user settings
  const userSettingsKey = `userSettings_${user.email}`;
  let userSettings = JSON.parse(localStorage.getItem(userSettingsKey));

  if (!userSettings) {
    // If no settings exist, initialize with default settings
    userSettings = DEFAULT_USER_SETTINGS;
    localStorage.setItem(userSettingsKey, JSON.stringify(userSettings));
  }

  // Save user data and settings
  localStorage.setItem('user', JSON.stringify({
    name: user.name,
    email: user.email,
    isLoggedIn: true,
    settings: userSettings, // Attach settings to the user object
  }));

  updateHeader();

  console.warn("Redirecting to settings page");
  window.setTimeout(() => {
    window.location.href = '/app-pages/settings.html';
  }, 100);
}

// Function to handle logout
// auth.js
export function handleLogout() {
  console.warn("Handling logout...");
  const user = JSON.parse(localStorage.getItem('user'));

  if (user) {
    // Reset settings to default on logout
    const userSettingsKey = `userSettings_${user.email}`;
    localStorage.setItem(userSettingsKey, JSON.stringify(DEFAULT_USER_SETTINGS));

    // Reset dark mode to default
    document.body.classList.remove('dark-mode');
    document.documentElement.classList.remove('dark-mode');
    localStorage.setItem('dark-mode', false);
  }

  localStorage.removeItem('user');
  updateHeader();
  console.warn("Header updated, redirecting to login page...");
  window.location.href = "/app-pages/login.html";
}


export function checkAuthState() {
  const user = JSON.parse(localStorage.getItem('user'));
  console.warn("Checking auth state:", user);
  return Boolean(user && user.isLoggedIn);
}

function attemptHeaderUpdate() {
  let attempts = 0;
  const maxAttempts = 5;
  const interval = setInterval(() => {
    if (document.getElementById('auth-button') && document.getElementById('logout-button')) {
      clearInterval(interval);
      updateHeader();
    } else if (++attempts >= maxAttempts) {
      clearInterval(interval);
      console.error("Failed to find header buttons after multiple attempts");
    }
  }, 100);
}

document.addEventListener('DOMContentLoaded', attemptHeaderUpdate);

