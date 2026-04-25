window.setupSmoothScrolling = function () {
  $('a[href^="#"]')
    .off("click")
    .on("click", function (event) {
      // Skip contact form overlay triggers
      if (this.classList.contains("open-contact-form")) {
        return;
      }

      if (
        this.getAttribute("target") === "_blank" ||
        !this.pathname.endsWith(
          location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
        )
      ) {
        return;
      }

      event.preventDefault();

      var href = this.getAttribute("href");

      if (href === "#") {
        $("html, body").animate(
          {
            scrollTop: 0,
          },
          2000
        );
        return;
      }

      var target = $(href);

      if (target.length) {
        $("html, body").animate(
          {
            scrollTop: target.offset().top - 80,
          },
          800
        );
      }
    });
};

window.setupHamburgerMenu = function () {
  var jumboNavEl = document.querySelector(".jumbo-nav");
  var jumboNavInnerEl = document.querySelector(".jumbo-nav .nav-inner");

  $(".hamburger-menu")
    .off("click")
    .on("click", function () {
      $(this).toggleClass("active");

      if (window.ParlourOverlay && jumboNavInnerEl) {
        var navHtml = jumboNavInnerEl.outerHTML;
        var overlay = window.ParlourOverlay.open(navHtml);

        // Handle regular nav link clicks — close overlay and let transition handle navigation
        overlay.querySelectorAll(".parlour-overlay-body a[href]").forEach(function (a) {
          // Handle contact form trigger links
          if (a.classList.contains("open-contact-form")) {
            a.addEventListener("click", function (e) {
              e.preventDefault();
              window.ParlourOverlay.close(overlay);
              $(".hamburger-menu").removeClass("active");
              if (typeof window.openContactForm === "function") {
                setTimeout(window.openContactForm, 350);
              }
            });
          // Skip magic trigger links
          } else if (a.classList.contains("do-magic") || a.getAttribute("href") === "#") {
            a.addEventListener("click", function (e) {
              e.preventDefault();
              e.stopPropagation();
              window.ParlourOverlay.close(overlay);
              $(".hamburger-menu").removeClass("active");
              // Trigger magic trick
              if (typeof window._startMagicTrick === "function") {
                setTimeout(window._startMagicTrick, 350);
              }
            });
          } else {
            a.addEventListener("click", function () {
              window.ParlourOverlay.close(overlay);
              $(".hamburger-menu").removeClass("active");
            });
          }
        });

        // Handle "Reveal the Method" span
        overlay.querySelectorAll(".parlour-overlay-body span.tell-secret").forEach(function (span) {
          span.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            window.ParlourOverlay.close(overlay);
            $(".hamburger-menu").removeClass("active");
            // Trigger secret overlay
            if (typeof window._showSecretOverlay === "function") {
              setTimeout(window._showSecretOverlay, 350);
            }
          });
        });

        // Reset hamburger when overlay closes
        var observer = new MutationObserver(function () {
          if (!overlay.classList.contains("visible")) {
            $(".hamburger-menu").removeClass("active");
          }
        });
        observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });
      } else if (jumboNavEl) {
        if ($(jumboNavEl).hasClass("open")) {
          $(jumboNavEl).css("right", "-100%");
          setTimeout(function () {
            $(jumboNavEl).removeClass("open");
            $(jumboNavEl).css("right", "");
          }, 300);
        } else {
          $(jumboNavEl).addClass("open");
          $(jumboNavEl).css("right", "0");
        }
      }
    });

  if (jumboNavEl) {
    $(".jumbo-nav a")
      .off("click.hamburger")
      .on("click.hamburger", function () {
        $(".hamburger-menu").removeClass("active");
        $(".jumbo-nav").css("right", "-100%");
        setTimeout(function () {
          $(".jumbo-nav").removeClass("open");
          $(".jumbo-nav").css("right", "");
        }, 300);
      });
  }
};

window.setupBackToTopButton = function () {
  var backToTopBtn = $("#back-to-top-btn");
  if (!backToTopBtn.length) return;

  $(window)
    .off("scroll.backToTop")
    .on("scroll.backToTop", function () {
      if ($(this).scrollTop() > 300) {
        backToTopBtn.fadeIn(300);
      } else {
        backToTopBtn.fadeOut(300);
      }
    });

  backToTopBtn.off("click").on("click", function (e) {
    e.preventDefault();
    $(this).addClass("levitating");
    var textElements = $("p, h1, h2, h3, h4, h5, h6, a").filter(function () {
      return !$(this).closest("").length;
    });
    textElements.each(function () {
      var element = $(this);
      var direction = Math.random() > 0.5 ? 1 : -1;
      var delay = Math.random() * 0.8;
      element.css({
        transition: "transform 1s ease " + delay + "s",
        "transform-origin": "center center",
      });
      setTimeout(function () {
        element.css("transform", "rotate(" + 360 * direction + "deg)");
        setTimeout(function () {
          element.css({ transition: "", transform: "" });
        }, 4000);
      }, 1000);
    });
    $("html, body").animate({ scrollTop: 0 }, 1000, function () {
      backToTopBtn.removeClass("levitating");
    });
  });
};
