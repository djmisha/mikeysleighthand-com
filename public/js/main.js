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

// Contact form overlay — clones markup from the <template> in the page HTML
window.openContactForm = function () {
  var tpl = document.getElementById("contact-form-template");
  if (!tpl) return;
  var clone = tpl.content.cloneNode(true);
  var wrapper = document.createElement("div");
  wrapper.appendChild(clone);

  window.SleighthandOverlay.open(wrapper.innerHTML);
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
