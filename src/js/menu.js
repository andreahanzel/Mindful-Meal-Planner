// menu.js
export function initializeMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const closeMenu = document.querySelector(".close-menu");
  const navMenu = document.querySelector(".nav-menu");

  if (!menuToggle || !closeMenu || !navMenu) {
      console.error("Menu elements not found");
      return;
  }

  // Open the sidebar
  menuToggle.addEventListener("click", function(e) {
      e.stopPropagation();  // Prevent event bubbling
      navMenu.classList.add("menu-open");

      // Hide ☰ when menu opens
      menuToggle.style.opacity = "0";
      menuToggle.style.visibility = "hidden";
  });

  // Close the sidebar
  closeMenu.addEventListener("click", function(e) {
      e.stopPropagation();
      navMenu.classList.remove("menu-open");

      // Show ☰ when menu closes
      menuToggle.style.opacity = "1";
      menuToggle.style.visibility = "visible";
  });

  // Close sidebar if user clicks outside of it
  document.addEventListener("click", function(event) {
      if (!navMenu.contains(event.target) && !menuToggle.contains(event.target) && !closeMenu.contains(event.target)) {
          navMenu.classList.remove("menu-open");

          // Show ☰ when menu closes
          menuToggle.style.opacity = "1";
          menuToggle.style.visibility = "visible";
      }
  });
}

// Make the function available globally
// window.initializeMenu = initializeMenu;
