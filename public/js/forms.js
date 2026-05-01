/**
 * Form validation and submission handling
 */

window.setupContactForm = function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  if (form.dataset.formReady) return;
  form.dataset.formReady = "true";

  var fields = [
    { name: "name", message: "Name is required" },
    { name: "email", message: "Email is required" },
    { name: "phone", message: "Phone number is required" },
    { name: "eventDate", message: "Event date is required" },
    { name: "venue", message: "Venue is required" },
    { name: "service", message: "Please select a service" },
    { name: "message", message: "Message is required" }
  ];

  function getInput(name) {
    return form.querySelector('[name="' + name + '"]');
  }

  function getError(name) {
    return form.querySelector("#" + name + "-error");
  }

  function validateEmail(value) {
    if (!value.trim()) return "Email is required";
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) return "Please enter a valid email address";
    if (value.toLowerCase().endsWith(".ru")) return "Sorry, emails from this domain are not accepted";
    return "";
  }

  function validatePhone(value) {
    if (!value.trim()) return "Phone number is required";
    var re = /^[0-9\-\(\)\s\+\.]+$/;
    if (!re.test(value)) return "Please enter a valid phone number";
    return "";
  }

  function validateField(field) {
    var input = getInput(field.name);
    var error = getError(field.name);
    if (!input || !error) return false;

    var value = input.value || "";
    var msg = "";

    if (field.name === "email") {
      msg = validateEmail(value);
    } else if (field.name === "phone") {
      msg = validatePhone(value);
    } else {
      msg = value.trim() ? "" : field.message;
    }

    if (msg) {
      error.textContent = msg;
      input.classList.add("error");
      return true;
    } else {
      error.textContent = "";
      input.classList.remove("error");
      return false;
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate all fields
    var hasError = false;
    for (var i = 0; i < fields.length; i++) {
      if (validateField(fields[i])) {
        hasError = true;
      }
    }

    if (hasError) return;

    // Disable button
    var btn = form.querySelector("#submit-button");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sending...";
    }

    // Submit to Netlify — manually encode to avoid URLSearchParams(FormData) issues
    var encode = function (key, value) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(value);
    };
    var parts = [encode("form-name", "contact")];
    for (var i = 0; i < fields.length; i++) {
      var input = getInput(fields[i].name);
      if (input) {
        parts.push(encode(fields[i].name, input.value));
      }
    }
    var botField = getInput("bot-field");
    if (botField) {
      parts.push(encode("bot-field", botField.value));
    }
    var formData = parts.join("&");

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    })
      .then(function (response) {
        if (response.ok) {
          // Replace entire overlay content with styled thank-you message
          var overlayForm = form.closest(".overlay-contact-form");
          if (overlayForm) {
            overlayForm.innerHTML =
              '<div class="form-success-message">' +
                '<div class="form-success-icon">\u2728</div>' +
                '<h2>Request Received</h2>' +
                '<p>Thank you for your booking request. We\u2019ll review your event details and get back to you within 24 hours.</p>' +
                '<button class="btn form-success-close">Close</button>' +
              '</div>';
            overlayForm.querySelector(".form-success-close").addEventListener("click", function () {
              window.SleighthandOverlay.closeTop();
            });
          }
        } else {
          showError(btn);
        }
      })
      .catch(function () {
        showError(btn);
      });
  });

  function showError(btn) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Request Booking";
    }
    var container = form.parentElement;
    var responseEl = container.querySelector("#form-response") || document.getElementById("form-response");
    if (responseEl) {
      responseEl.style.display = "block";
      responseEl.classList.add("error");
      responseEl.classList.remove("success");
      responseEl.querySelector("p").textContent = "Something went wrong. Please try again later.";
    }
  }
};
