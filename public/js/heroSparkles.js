/* heroSparkles.js - Ambient sparkle effect for hero and scene sections */
(function () {
  function createHeroSparkles() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Remove containers left by the previous page before re-running
    document.querySelectorAll(".hero-sparkle-container").forEach(function (el) {
      el.remove();
    });

    var heroes = document.querySelectorAll(".scene-section, .hero-section, .content-hero");

    heroes.forEach(function (hero, index) {
      // Alternate sparkle colors: warm gold and white for cinematic feel
      var sparkleColor = index % 2 === 0 ? "#ffd700" : "#ffffff";
      var shadowColor = index % 2 === 0 ? "rgba(255, 215, 0, 0.6)" : "rgba(255, 255, 255, 0.6)";

      // Create sparkle container
      var sparkleContainer = document.createElement("div");
      sparkleContainer.className = "hero-sparkle-container";
      sparkleContainer.style.position = "absolute";
      sparkleContainer.style.bottom = "0";
      sparkleContainer.style.left = "0";
      sparkleContainer.style.width = "100%";
      sparkleContainer.style.height = Math.round(hero.clientHeight / 3) + "px";
      sparkleContainer.style.overflow = "hidden";
      sparkleContainer.style.pointerEvents = "none";
      sparkleContainer.style.zIndex = "1";
      hero.appendChild(sparkleContainer);

      var isActive = true;
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isActive = entry.isIntersecting;
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(hero);

      // Continuously spawn sparkles
      function spawnSparkle() {
        if (!document.body.contains(sparkleContainer)) return;
        if (!isActive) {
          setTimeout(spawnSparkle, 600);
          return;
        }

        var sparkle = document.createElement("div");
        sparkle.style.position = "absolute";
        sparkle.style.width = (1 + Math.random() * 3) + "px";
        sparkle.style.height = sparkle.style.width;
        sparkle.style.background = sparkleColor;
        sparkle.style.borderRadius = "50%";
        sparkle.style.left = Math.random() * 100 + "%";
        sparkle.style.bottom = Math.random() * sparkleContainer.clientHeight * 0.4 + "px";
        sparkle.style.opacity = "0";
        sparkle.style.boxShadow = "0 0 4px " + shadowColor;
        sparkleContainer.appendChild(sparkle);

        // Animate: fade in, drift upward, fade out
        var duration = 2000 + Math.random() * 2500;
        var driftX = (Math.random() - 0.5) * 50;
        var driftY = -(60 + Math.random() * 120);

        sparkle.animate([
          { opacity: 0, transform: "translate(0, 0) scale(0)" },
          { opacity: 0.9, transform: "translate(" + (driftX * 0.3) + "px, " + (driftY * 0.3) + "px) scale(1)", offset: 0.3 },
          { opacity: 0.7, transform: "translate(" + (driftX * 0.7) + "px, " + (driftY * 0.7) + "px) scale(1.2)", offset: 0.7 },
          { opacity: 0, transform: "translate(" + driftX + "px, " + driftY + "px) scale(0)" }
        ], {
          duration: duration,
          easing: "ease-in-out"
        }).onfinish = function () {
          sparkle.remove();
        };

        // Schedule next sparkle
        setTimeout(spawnSparkle, 100 + Math.random() * 200);
      }

      // Start spawning with a small delay per hero
      setTimeout(spawnSparkle, Math.random() * 500);
    });
  }

  // Exposed for re-initialization after AJAX navigation
  window.initHeroSparkles = createHeroSparkles;

  document.addEventListener("DOMContentLoaded", createHeroSparkles);
})();
