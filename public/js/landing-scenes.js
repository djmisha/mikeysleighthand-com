(function () {
  "use strict";

  /**
   * landing-scenes.js
   * ──────────────────────────────────────────────────────────────────────────
   * Handles two responsibilities that are separate from the scroll-hijack
   * animation system:
   *
   *   1. assignSceneBackgrounds — randomises the background images assigned
   *      to the named scene sections on every page load.
   *
   *   2. initFloatUpAnimations  — triggers the float-up entrance animation
   *      for testimonial cards and FAQ items as the user scrolls through
   *      those scenes.  These elements use .float-up-item / .animated classes
   *      rather than the .text-reveal system managed by scroll-hijack.js.
   *
   * Text-reveal class assignment and all scene-transition animations are
   * handled entirely by scroll-hijack.js.
   */

  // ── Scene background image pool ────────────────────────────────────────────

  var SCENE_IDS = ["hero", "services", "cards-coins", "close-up-illusions", "cta"];
  var IMAGE_POOL = [
    "/image/hero-01.webp",
    "/image/hero-02.webp",
    "/image/hero-03.webp",
    "/image/hero-04.webp",
    "/image/hero-05.webp",
    "/image/hero-06.webp",
    "/image/hero-07.webp",
    "/image/hero-08.webp",
    "/image/hero-09.webp",
    "/image/hero-10.webp"
  ];

  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  /** Assigns a unique random hero image to each named scene section. */
  function assignSceneBackgrounds() {
    var shuffled = shuffle(IMAGE_POOL);
    var selected = shuffled.slice(0, SCENE_IDS.length);
    if (!selected.length) return;

    SCENE_IDS.forEach(function (id, index) {
      var section = document.getElementById(id);
      if (!section) return;
      section.style.backgroundImage = "url(" + selected[index] + ")";
    });
  }

  // ── Contact form overlay ───────────────────────────────────────────────────

  // NOTE: window.openContactForm is the canonical definition in main.js.
  // This copy is kept here for backward compatibility with any callers that
  // load landing-scenes.js in isolation.  Both definitions are functionally
  // identical; the last one to load wins at runtime.
  // TODO: Remove this copy once it is confirmed no external callers depend on it.
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
                '<input type="date" id="eventDate" name="eventDate" required>' +
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
                '<option value="strolling-magic">Strolling magic $5000</option>' +
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

    window.ParlourOverlay.open(html);
    window.setupContactForm();
  };

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".open-contact-form");
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();
    window.openContactForm();
  }, true);

  // ── Float-up animations (testimonials, FAQ items) ──────────────────────────

  /**
   * Watches .float-up-item elements and adds the .animated class once they
   * enter the viewport.  This is a one-way, one-time animation — items are
   * never reset.  Works in tandem with the scroll-hijack system because
   * scroll-hijack fires window scroll events via window.scrollTo(), which
   * keeps this observer functioning normally.
   */
  function initFloatUpAnimations() {
    var floatUpItems = document.querySelectorAll('.float-up-item');
    if (floatUpItems.length === 0) return;

    function checkFloatUp() {
      var windowHeight = window.innerHeight;
      floatUpItems.forEach(function (item) {
        if (item.classList.contains('animated')) return;
        var rect = item.getBoundingClientRect();
        // Trigger when the item is 85% into the viewport
        if (rect.top < windowHeight * 0.85 && rect.bottom > 0) {
          item.classList.add('animated');
        }
      });
    }

    setTimeout(checkFloatUp, 100);
    window.addEventListener('scroll', checkFloatUp);
  }

  // ── Initialise ────────────────────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", function () {
    assignSceneBackgrounds();
    if (typeof window.initHeroSparkles === "function") {
      window.initHeroSparkles();
    }
  });

  // Float-up watcher starts immediately (script is loaded at end of body)
  initFloatUpAnimations();

})();
