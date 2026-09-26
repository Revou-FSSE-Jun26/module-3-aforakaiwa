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
