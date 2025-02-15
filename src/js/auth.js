const PASSWORD_REGEX = {
  length: /.{12,}/,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/
};

const DEFAULT_USER_SETTINGS = {
  darkMode: false,
  notifications: false,
  emailUpdates: false,
  autoSave: false,
};

// This function initializes the authentication process
export function initializeAuth() {
  console.warn("Initializing auth...");
  
  if (window.location.pathname.includes('login.html')) {
      localStorage.removeItem('user');
  }

  const signUpButton = document.getElementById('signUp');
  const signInButton = document.getElementById('signIn');
  const container = document.querySelector('.auth-forms');
  const loginForm = document.querySelector('#login-form');
  const signupForm = document.querySelector('#signup-form');
  const signInContainer = document.querySelector('.sign-in-container');
  const signUpContainer = document.querySelector('.sign-up-container');

  if (!loginForm || !signupForm) {
      console.warn("Login or signup form not found");
      return;
  }

  setupFormSwitching(signUpButton, signInButton, container, signInContainer, signUpContainer);
  setupPasswordToggles();
  setupPasswordValidation();

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (signupForm) signupForm.addEventListener('submit', handleSignup);

  // Initial state
  if (signInContainer) signInContainer.style.display = "flex";
  if (signUpContainer) signUpContainer.style.display = "none";
}

function setupFormSwitching(signUpButton, signInButton, container, signInContainer, signUpContainer) {
  if (signUpButton) {
      signUpButton.addEventListener('click', () => {
          container.classList.add("right-panel-active");
          if (signInContainer) {
              signInContainer.style.visibility = "hidden";
              signInContainer.style.display = "none";
          }
          if (signUpContainer) {
              signUpContainer.style.visibility = "visible";
              signUpContainer.style.display = "flex";
          }
          resetFormState();
      });
  }

  if (signInButton) {
      signInButton.addEventListener('click', () => {
          container.classList.remove("right-panel-active");
          if (signUpContainer) {
              signUpContainer.style.visibility = "hidden";
              signUpContainer.style.display = "none";
          }
          if (signInContainer) {
              signInContainer.style.visibility = "visible";
              signInContainer.style.display = "flex";
          }
          resetFormState();
      });
  }
}
// This function resets the form state by clearing error messages and hiding the password requirements
function resetFormState() {
  const passwordRequirements = document.getElementById('password-requirements');
  const errorMessages = document.querySelectorAll('.error-message');
  
  if (passwordRequirements) {
      passwordRequirements.classList.remove('visible');
  }
  
  errorMessages.forEach(msg => msg.textContent = '');
}
// This function sets up the password toggle functionality
function setupPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(button => {
      button.addEventListener('click', (e) => {
          const input = e.target.closest('.password-input-wrapper').querySelector('input');
          const icon = e.target.querySelector('.eye-icon');
          
          if (input.type === 'password') {
              input.type = 'text';
              icon.textContent = '🔒';
          } else {
              input.type = 'password';
              icon.textContent = '👁️';
          }
      });
  });
}
// This function sets up the password validation functionality
function setupPasswordValidation() {
  const signupPassword = document.getElementById('signup-password');
  const passwordRequirements = document.getElementById('password-requirements');

  if (signupPassword && passwordRequirements) {
      signupPassword.addEventListener('focus', () => {
          passwordRequirements.classList.add('visible');
      });

      signupPassword.addEventListener('input', (e) => {
          updatePasswordRequirements(e.target.value);
      });

      signupPassword.addEventListener('blur', () => {
          if (!signupPassword.value) {
              passwordRequirements.classList.remove('visible');
          }
      });
  }
}
// This function updates the password requirements based on the input value
function updatePasswordRequirements(password) {
  const validation = validatePassword(password);
  document.getElementById('length-check').className = validation.checks.length ? 'valid' : 'invalid';
  document.getElementById('uppercase-check').className = validation.checks.uppercase ? 'valid' : 'invalid';
  document.getElementById('number-check').className = validation.checks.number ? 'valid' : 'invalid';
  document.getElementById('special-check').className = validation.checks.special ? 'valid' : 'invalid';
}
//  This function validates the password based on the defined regex patterns
function validatePassword(password) {
  const checks = {
      length: PASSWORD_REGEX.length.test(password),
      uppercase: PASSWORD_REGEX.uppercase.test(password),
      number: PASSWORD_REGEX.number.test(password),
      special: PASSWORD_REGEX.special.test(password)
  };
  
  return {
      isValid: Object.values(checks).every(check => check),
      checks
  };
}

// This function updates the header based on the user's authentication state
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
  const errorMessage = document.getElementById('login-error-message');
  errorMessage.textContent = '';

  const email = e.target.querySelector('input[name="email"]').value;
  const password = e.target.querySelector('input[name="password"]').value;

  try {
      const storedUser = JSON.parse(localStorage.getItem('registeredUser'));
      
      if (storedUser && storedUser.email === email && storedUser.password === password) {
          loginSuccess(storedUser);
          return;
      }

      errorMessage.textContent = 'Invalid email or password';
      return;
    } catch (error) {
      console.error('Login error:', error); // ✓ Added error logging
      errorMessage.textContent = 'An error occurred during login';
  }
}
// This function handles the signup process
async function handleSignup(e) {
  e.preventDefault();
  const errorMessage = document.getElementById('signup-error-message');
  errorMessage.textContent = '';

  const name = e.target.querySelector('input[name="name"]').value;
  const email = e.target.querySelector('input[name="email"]').value;
  const password = e.target.querySelector('input[name="password"]').value;

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
      errorMessage.textContent = 'Password does not meet requirements';
      return;
  }

  try {
      const storedUser = JSON.parse(localStorage.getItem('registeredUser'));
      if (storedUser && storedUser.email === email) {
          errorMessage.textContent = 'Email already exists. Please login instead.';
          return;
      }

      const newUser = { name, email, password };
      localStorage.setItem('registeredUser', JSON.stringify(newUser));
      loginSuccess(newUser);
    } catch (error) {
      console.error('Signup error:', error); // ✓ Added error logging
      errorMessage.textContent = 'An error occurred during signup';
  }
}

// This function handles the successful login process
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

