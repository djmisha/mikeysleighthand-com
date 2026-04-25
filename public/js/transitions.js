/* transitions.js — Magical page transition with sparkle rain
 * Strategy: AJAX — fetch new page content, inject into <main>, update URL via pushState.
 * The browser never navigates; overlay is dark before any DOM change occurs.
 * Outgoing: snap to dark → fetch → inject → pushState → sparkle reveal
 * Fallback: real navigation (+ sessionStorage flag) if fetch fails
 */
(function () {
  "use strict";

  var overlay = document.getElementById("magic-transition-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "magic-transition-overlay";
    overlay.className = "magic-transition-overlay";
    document.body.appendChild(overlay);
  }

  var SESSION_KEY = "parlour-transition";
  // 40% chance of gold sparkles, 60% white — used in createSparkleWave
  var GOLD_SPARKLE_RATIO = 0.4;
  var _navigating = false;

  // --- Sparkle rain wave ---
  function createSparkleWave(count, startDelay) {
    for (var i = 0; i < count; i++) {
      (function (index) {
        setTimeout(function () {
          var sparkle = document.createElement("div");
          sparkle.className = "sparkle-rain";
          var size = 1.5 + Math.random() * 3.5;
          sparkle.style.width = size + "px";
          sparkle.style.height = size + "px";
          sparkle.style.left = Math.random() * 100 + "%";
          sparkle.style.setProperty(
            "--fall-distance",
            150 + Math.random() * window.innerHeight * 0.7 + "px"
          );
          sparkle.style.setProperty(
            "--fall-duration",
            0.7 + Math.random() * 1.2 + "s"
          );
          var drift = (Math.random() - 0.5) * 80;
          sparkle.style.setProperty("--drift-x", drift + "px");
          sparkle.style.background =
            Math.random() > GOLD_SPARKLE_RATIO ? "#ffffff" : "#c9a959";
          overlay.appendChild(sparkle);
          setTimeout(function () {
            if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
          }, 2500);
        }, startDelay + index * 8);
      })(i);
    }
  }

  // --- Reveal: sparkle rain then fade overlay out ---
  function revealPage() {
    createSparkleWave(120, 0);
    createSparkleWave(100, 200);
    createSparkleWave(80, 500);
    setTimeout(function () {
      overlay.style.transition = "opacity 0.7s ease";
      overlay.style.opacity = "0";
      setTimeout(function () {
        overlay.classList.remove("active");
        overlay.style.transition = "";
        overlay.style.opacity = "";
        _navigating = false;
      }, 750);
    }, 1400);
  }

  // --- Incoming: arriving via real navigation (fallback path only) ---
  if (sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.removeItem(SESSION_KEY);
    var initStyle = document.getElementById("parlour-transition-init");
    if (initStyle) initStyle.parentNode.removeChild(initStyle);
    overlay.style.opacity = "1";
    overlay.classList.add("active");
    revealPage();
  }

  // --- AJAX navigation ---
  function performTransition(url) {
    if (_navigating) return;
    _navigating = true;

    // Start fetch immediately — runs in parallel with the fade-to-dark animation
    var fetchPromise = fetch(url, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("fetch-failed");
        return res.text();
      });

    // Fade to dark — CSS transition (0.3s) handles the animation
    overlay.classList.add("active");

    // Wait for both the fade AND the fetch before injecting content
    var fadePromise = new Promise(function (resolve) {
      setTimeout(resolve, 300);
    });

    Promise.all([fadePromise, fetchPromise])
      .then(function (results) {
        var html = results[1];
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        // Swap <main> content
        var newMain = doc.querySelector("main");
        var currentMain = document.querySelector("main");
        if (newMain && currentMain) {
          currentMain.innerHTML = newMain.innerHTML;
        }

        // Update <title>
        var newTitle = doc.querySelector("title");
        if (newTitle) document.title = newTitle.textContent;

        // Update meta description
        var newDesc = doc.querySelector("meta[name='description']");
        var curDesc = document.querySelector("meta[name='description']");
        if (newDesc && curDesc) {
          curDesc.setAttribute("content", newDesc.getAttribute("content"));
        }

        // URL changes here — page is dark and content is already in the DOM
        history.pushState({ url: url }, document.title, url);

        // Scroll to top
        window.scrollTo(0, 0);

        // Re-initialize all page JS modules
        if (typeof window.reinitPage === "function") {
          window.reinitPage();
        }

        // Sparkle reveal
        revealPage();
      })
      .catch(function () {
        // Fetch failed — fall back to real navigation
        sessionStorage.setItem(SESSION_KEY, "1");
        window.location.href = url;
      });
  }

  // --- Intercept navigation clicks ---
  document.addEventListener(
    "click",
    function (e) {
      var target = e.target.closest("a");
      if (!target || !target.href) return;

      if (
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download") ||
        (target.protocol !== "http:" && target.protocol !== "https:") ||
        target.hostname !== window.location.hostname
      ) {
        return;
      }

      if (target.pathname === window.location.pathname && target.search === window.location.search) return;
      if (target.href === window.location.href) return;
      if (target.hasAttribute("data-no-transition")) return;

      e.preventDefault();
      performTransition(target.href);
    },
    true
  );

  // Back/forward button — re-fetch the target page via AJAX
  window.addEventListener("popstate", function (e) {
    var url = (e.state && e.state.url) || location.href;
    performTransition(url);
  });
})();

