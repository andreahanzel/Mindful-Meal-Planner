// This script handles the newsletter subscription form.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");
  const emailInput = document.getElementById("newsletter-email");
  const message = document.getElementById("newsletter-message");

  // Function to validate email format
  const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  };

  form.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = emailInput.value.trim();

      // Check if email is empty or invalid
      if (!email || !isValidEmail(email)) {
          message.textContent = "Please enter a valid email address.";
          message.style.color = "red";
          return;
      }

      try {
          // Get existing subscribers or initialize empty array
          const existingSubscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
          
          // Check if email already exists
          if (existingSubscribers.some(sub => sub.email === email)) {
              message.textContent = "This email is already subscribed!";
              message.style.color = "white";
              return;
          }

          // Add new subscriber
          existingSubscribers.push({
              email,
              date: new Date().toISOString()
          });

          // Save back to localStorage
          localStorage.setItem('subscribers', JSON.stringify(existingSubscribers));

          // Success message
          message.textContent = "🎉 Thank you for subscribing!";
          message.style.color = "white";
          emailInput.value = ""; // Clear input

      } catch (error) {
          console.error("Error:", error);
          message.textContent = "⚠️ Something went wrong. Try again.";
          message.style.color = "red";
      }
  });
});
