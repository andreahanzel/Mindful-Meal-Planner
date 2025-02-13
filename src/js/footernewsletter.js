// src/js/footerNewsletter.js
export function initializeFooterNewsletter() {
  const footerForm = document.getElementById("footer-newsletter-form");
  const footerEmailInput = document.getElementById("footer-newsletter-email");
  const footerMessage = document.getElementById("footer-newsletter-message");

  // Function to validate email format
  const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  };

  if (footerForm) {
      footerForm.addEventListener("submit", (event) => {
          event.preventDefault();

          const email = footerEmailInput.value.trim();

          // Check if email is empty or invalid
          if (!email || !isValidEmail(email)) {
              footerMessage.textContent = "Please enter a valid email address.";
              footerMessage.style.color = "red";
              return;
          }

          try {
              // Get existing subscribers or initialize empty array
              const existingSubscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
              
              // Check if email already exists
              if (existingSubscribers.some(sub => sub.email === email)) {
                  footerMessage.textContent = "This email is already subscribed!";
                  footerMessage.style.color = "white";
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
              footerMessage.textContent = "🎉 Thank you for subscribing!";
              footerMessage.style.color = "white";
              footerEmailInput.value = ""; // Clear input

          } catch (error) {
              console.error("Error:", error);
              footerMessage.textContent = "⚠️ Something went wrong. Try again.";
              footerMessage.style.color = "red";
          }
      });
  }
}
