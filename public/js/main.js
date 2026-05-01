// Main.js - Initializes all functionality

// Random hero image for the homepage
window.setupRandomHero = function () {
  var hero = document.getElementById('hero');
  if (!hero || !hero.classList.contains('hero-home')) return;
  var total = 10;
  var index = Math.floor(Math.random() * total) + 1;
  var pad = index < 10 ? '0' + index : '' + index;
  hero.style.backgroundImage = 'url(/image/hero-' + pad + '.webp)';
};

// Contact form overlay
window.openContactForm = function () {
  var html =
    '<div class="overlay-contact-form">' +
      '<h2>Book Your Event</h2>' +
      '<p class="section-intro">Reserve Mikey Sleighthand for your event. Share your details below and we will follow up with availability and options.</p>' +
      '<div class="form-container">' +
        '<form id="contact-form" class="contact-form" method="post" name="contact" novalidate>' +
          '<input type="hidden" name="form-name" value="contact">' +
          '<div class="form-row">' +
            '<div class="form-group form-group-half">' +
              '<label for="name">Full Name</label>' +
              '<input type="text" id="name" name="name" placeholder="Your full name" required>' +
              '<span class="error-message" id="name-error"></span>' +
            '</div>' +
            '<div class="form-group form-group-half">' +
              '<label for="email">Email Address</label>' +
              '<input type="email" id="email" name="email" placeholder="your.email@example.com" required>' +
              '<span class="error-message" id="email-error"></span>' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group form-group-half">' +
              '<label for="phone">Phone Number</label>' +
              '<input type="tel" id="phone" name="phone" placeholder="Your phone number" required>' +
              '<span class="error-message" id="phone-error"></span>' +
            '</div>' +
            '<div class="form-group form-group-half">' +
              '<label for="eventDate">Event Date</label>' +
              '<input type="text" id="eventDate" name="eventDate" placeholder="MM/DD/YYYY" required>' +
              '<span class="error-message" id="eventDate-error"></span>' +
            '</div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group form-group-half">' +
              '<label for="venue">Venue</label>' +
              '<input type="text" id="venue" name="venue" placeholder="Event venue name or location" required>' +
              '<span class="error-message" id="venue-error"></span>' +
            '</div>' +
            '<div class="form-group form-group-half">' +
              '<label for="service">Service</label>' +
              '<select id="service" name="service" required>' +
                '<option value="" disabled selected>Select a Service</option>' +
                '<option value="strolling-magic">Strolling Magic \u2014 $5,000</option>' +
              '</select>' +
              '<span class="error-message" id="service-error"></span>' +
            '</div>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="message">Additional Details</label>' +
            '<textarea id="message" name="message" placeholder="Tell us about your event, guest count, or any special requests" rows="4" required></textarea>' +
            '<span class="error-message" id="message-error"></span>' +
          '</div>' +
          '<div class="form-group honeypot">' +
            '<label for="bot-field">Bot Field</label>' +
            '<input type="text" id="bot-field" name="bot-field" autocomplete="off">' +
          '</div>' +
          '<div class="form-submit">' +
            '<button type="submit" class="btn" id="submit-button">Request Booking</button>' +
          '</div>' +
        '</form>' +
        '<div id="form-response" class="form-response"><p></p></div>' +
      '</div>' +
    '</div>';

  window.SleighthandOverlay.open(html);
  window.setupContactForm();
};

// Delegated click handler for contact form triggers
document.addEventListener('click', function (e) {
  var trigger = e.target.closest('.open-contact-form');
  if (trigger) {
    e.preventDefault();
    e.stopPropagation();
    window.openContactForm();
  }
}, true);

// reinitPage is called both on first load and after every AJAX navigation
window.reinitPage = function () {
  window.setupRandomHero();
  window.setupSmoothScrolling();
  window.setupContactForm();
  window.setupOwlChatbot();
  if (typeof window.initHeroSparkles === "function") {
    window.initHeroSparkles();
  }
};

$(document).ready(function () {
  window.reinitPage();
});
