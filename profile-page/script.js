// Contact form validation
const form = document.querySelector(".contact-form");

if (form) {
  form.addEventListener("submit", function (event) {
    // If any required/typed field is invalid, stop the submit
    if (!form.checkValidity()) {
      event.preventDefault();
    }
    // Turn on the "validated" state so invalid fields show their red style + message
    form.classList.add("was-validated");
  });
}

// "View More" toggle for each card
const toggleButtons = document.querySelectorAll(".card__toggle");

toggleButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const card = button.closest(".card");

    // Toggle the open state on the card and read the new state back
    const isOpen = card.classList.toggle("is-open");

    // Update the button label and accessibility state
    button.textContent = isOpen ? "View Less" : "View More";
    button.setAttribute("aria-expanded", isOpen);
  });
});
