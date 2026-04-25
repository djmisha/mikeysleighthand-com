(function () {
  "use strict";

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

  function assignSceneBackgrounds() {
    // Ensure we select at least 5 unique images for 5 sections
    var shuffled = shuffle(IMAGE_POOL);
    var selected = shuffled.slice(0, 5); // Take first 5 unique images
    if (!selected.length) return;

    SCENE_IDS.forEach(function (id, index) {
      var section = document.getElementById(id);
      if (!section) return;

      var image = selected[index]; // Direct assignment, no modulo
      section.style.backgroundImage = "url(" + image + ")";
    });
  }

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

  document.addEventListener("DOMContentLoaded", function () {
    assignSceneBackgrounds();
    if (typeof window.initHeroSparkles === "function") {
      window.initHeroSparkles();
    }
    
    // Initialize text reveal animations
    setupTextRevealAnimations();
  });

  // Text reveal animations for all sections
  function setupTextRevealAnimations() {
    // Add text-reveal class to elements that should animate
    var sections = document.querySelectorAll(".scene-section");
    var lastScrollPosition = 0;
    
    sections.forEach(function (section) {
      // Add animation classes with staggered delays
      var h1 = section.querySelector("h1");
      if (h1) {
        h1.classList.add("text-reveal");
      }
      
      var h2 = section.querySelector("h2");
      if (h2) {
        h2.classList.add("text-reveal", "text-reveal-delay-1");
      }
      
      var sectionIntros = section.querySelectorAll(".section-intro, .hero-subhead");
      sectionIntros.forEach(function (el) {
        el.classList.add("text-reveal", "text-reveal-delay-2");
      });
      
      var heroParagraphs = section.querySelectorAll(".hero-content > p:not(.hero-subhead):not(.section-intro)");
      heroParagraphs.forEach(function (el) {
        el.classList.add("text-reveal", "text-reveal-delay-2");
      });
      
      var buttons = section.querySelectorAll(".btn");
      buttons.forEach(function (el) {
        el.classList.add("text-reveal", "text-reveal-delay-3");
      });
    });

    // Scroll handler to trigger animations
    function checkTextReveal() {
      var scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      var windowHeight = window.innerHeight;
      var scrollDirection = scrollPosition > lastScrollPosition ? 'down' : 'up';
      lastScrollPosition = scrollPosition;
      
      // Detect mobile device for longer text visibility
      var isMobile = window.innerWidth < 768;
      var mobileOffset = isMobile ? 150 : 0; // Add 150px delay on mobile

      sections.forEach(function (section) {
        var rect = section.getBoundingClientRect();
        var sectionTop = rect.top + scrollPosition;
        var sectionBottom = rect.bottom + scrollPosition;
        
        // Check if this is the hero section
        var isHero = section.id === 'hero' || section.classList.contains('hero-section');
        
        // Check if this section should not fade out when scrolled past
        var noFadeout = section.classList.contains('no-fadeout');
        
        var reveals = section.querySelectorAll(".text-reveal");
        
        // Asymmetric trigger points based on scroll direction
        var triggerEnterDown = sectionTop - windowHeight + 400; // Scroll down: appear 400px before entering
        var triggerEnterUp = sectionTop - windowHeight - 100; // Scroll up: reappear much sooner (as soon as bottom enters viewport)
        var triggerExit = sectionTop - (150 + mobileOffset); // When to fade out above (longer on mobile)
        
        if (isHero && scrollPosition < windowHeight) {
          // Hero section: always show when near top of page
          reveals.forEach(function (el) {
            el.classList.add("visible");
            el.classList.remove("scrolled-past");
          });
        } else if (scrollPosition > triggerExit && rect.top < 0 && !noFadeout) {
          // Section has been scrolled past - fade out upward (skip if noFadeout)
          reveals.forEach(function (el) {
            el.classList.remove("visible");
            el.classList.add("scrolled-past");
          });
        } else if ((scrollDirection === 'down' && scrollPosition > triggerEnterDown && rect.bottom > 0) ||
                   (scrollDirection === 'up' && scrollPosition > triggerEnterUp && rect.bottom > 0)) {
          // Section is in viewport - show (with different triggers based on direction)
          reveals.forEach(function (el) {
            el.classList.add("visible");
            el.classList.remove("scrolled-past");
          });
        } else {
          // Section is below viewport or way above - reset to hidden below state
          reveals.forEach(function (el) {
            el.classList.remove("visible");
            el.classList.remove("scrolled-past");
          });
        }
      });
    }

    // Initial check and scroll listener
    // Use small delay to ensure DOM is fully rendered, then immediately trigger hero
    setTimeout(function() {
      checkTextReveal();
      // Force trigger hero immediately
      var heroSection = document.getElementById('hero');
      if (heroSection) {
        var reveals = heroSection.querySelectorAll(".text-reveal");
        reveals.forEach(function (el) {
          el.classList.add("visible");
        });
      }
    }, 50);
    window.addEventListener("scroll", checkTextReveal);
  }

  // Float-up animation for testimonial cards and FAQ items
  function initFloatUpAnimations() {
    var floatUpItems = document.querySelectorAll('.float-up-item');
    
    if (floatUpItems.length === 0) return;

    function checkFloatUp() {
      var windowHeight = window.innerHeight;

      floatUpItems.forEach(function(item) {
        // Skip if already animated
        if (item.classList.contains('animated')) return;

        var rect = item.getBoundingClientRect();
        var triggerPoint = windowHeight * 0.85; // Trigger when item is 85% into viewport

        // Add animated class when item enters viewport (only once, never remove)
        if (rect.top < triggerPoint && rect.bottom > 0) {
          item.classList.add('animated');
        }
      });
    }

    // Initial check
    setTimeout(checkFloatUp, 100);
    
    // Check on scroll
    window.addEventListener('scroll', checkFloatUp);
  }

  // Initialize float-up animations
  initFloatUpAnimations();
})();
