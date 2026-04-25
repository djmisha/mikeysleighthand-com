/**
 * Particle Manager - Manages the particles.js library for the site
 */
document.addEventListener("DOMContentLoaded", function () {
  // Set up particles container
  const setupParticlesContainer = () => {
    if (document.getElementById("particles-js")) {
      return;
    }

    const particlesContainer = document.createElement("div");
    particlesContainer.id = "particles-js";
    particlesContainer.style.position = "fixed";
    particlesContainer.style.top = "0";
    particlesContainer.style.left = "0";
    particlesContainer.style.width = "100%";
    particlesContainer.style.height = "100%";
    particlesContainer.style.zIndex = "999";
    particlesContainer.style.pointerEvents = "none";
    particlesContainer.style.display = "none";
    document.body.prepend(particlesContainer);
  };

  // White sparkle particle configuration
  const particlesConfig = {
    particles: {
      number: {
        value: 120,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#ffffff",
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000",
        },
      },
      opacity: {
        value: 0.8,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.5,
          sync: false,
        },
      },
      line_linked: {
        enable: false,
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: "bottom",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "bubble",
        },
        onclick: {
          enable: false,
        },
        resize: true,
      },
      modes: {
        bubble: {
          distance: 150,
          size: 5,
          duration: 0.5,
          opacity: 1,
          speed: 3,
        },
      },
    },
    retina_detect: true,
  };

  // Initialize particles
  const initParticles = () => {
    const particlesContainer = document.getElementById("particles-js");

    if (particlesContainer.style.display === "none") {
      particlesContainer.style.display = "block";
      particlesJS("particles-js", particlesConfig);

      const magicEyes = document.querySelector(".magic-eyes");
      if (magicEyes) {
        magicEyes.classList.add("particles-active");
      }
    } else {
      particlesContainer.style.display = "none";

      const magicEyes = document.querySelector(".magic-eyes");
      if (magicEyes) {
        magicEyes.classList.remove("particles-active");
      }
    }
  };

  // Setup particles container
  setupParticlesContainer();

  // Add event listener to the magic eyes
  const magicEyes = document.querySelector(".magic-eyes");
  if (magicEyes) {
    magicEyes.addEventListener("click", function (e) {
      e.preventDefault();
      initParticles();
    });

    magicEyes.style.cursor = "pointer";
    magicEyes.setAttribute("title", "Toggle magical sparkles");
  }
});
