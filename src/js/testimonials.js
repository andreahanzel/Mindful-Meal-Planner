// This script handles the scrolling functionality for the testimonials section.
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".testimonial-scroll");
  const testimonials = document.querySelectorAll(".testimonial-content");
  const leftBtn = document.querySelector(".scroll-btn.left");
  const rightBtn = document.querySelector(".scroll-btn.right");

  let index = 0;

// Set the initial position of the testimonials
  function updateTestimonials() {
      const offset = -index * 100; 
      container.style.transform = `translateX(${offset}%)`;
  }

  // Initialize the testimonials position on page load
  function scrollTestimonials(direction) {
      if (direction === 1 && index < testimonials.length - 1) {
          index++;
      } else if (direction === -1 && index > 0) {
          index--;
      }
      updateTestimonials();
  }

  leftBtn.addEventListener("click", () => scrollTestimonials(-1));
  rightBtn.addEventListener("click", () => scrollTestimonials(1));
});
