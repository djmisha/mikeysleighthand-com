/* overlay.js — Reusable full-screen overlay system for the site
 * Supports stacking: each call opens a new layer on top.
 * Close button is always top-left. ESC closes the top overlay.
 */
(function () {
  var BASE_Z = 10100;

  window.SleighthandOverlay = {
    stack: [],

    open: function (contentHtml, options) {
      options = options || {};
      var zIndex = BASE_Z + this.stack.length * 10;

      var overlay = document.createElement("div");
      overlay.className = "sleighthand-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.style.zIndex = zIndex;

      overlay.innerHTML =
        '<button class="sleighthand-overlay-close" aria-label="Close overlay (Escape)" title="Close (Esc)">\u2715</button>' +
        '<div class="sleighthand-overlay-body">' +
        contentHtml +
        "</div>";

      document.body.appendChild(overlay);
      document.body.classList.add("overlay-open");

      // Animate in
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          overlay.classList.add("visible");
        });
      });

      // Close button
      var closeBtn = overlay.querySelector(".sleighthand-overlay-close");
      closeBtn.addEventListener("click", function () {
        window.SleighthandOverlay.close(overlay);
      });

      // Close on backdrop click (not on content)
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          window.SleighthandOverlay.close(overlay);
        }
      });

      this.stack.push(overlay);
      return overlay;
    },

    close: function (overlay) {
      if (!overlay) return;
      overlay.classList.remove("visible");
      var self = this;
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        self.stack = self.stack.filter(function (el) {
          return el !== overlay;
        });
        if (self.stack.length === 0) {
          document.body.classList.remove("overlay-open");
        }
      }, 400);
    },

    closeTop: function () {
      if (this.stack.length) {
        this.close(this.stack[this.stack.length - 1]);
      }
    },

    closeAll: function () {
      var self = this;
      var toClose = this.stack.slice();
      toClose.forEach(function (overlay) {
        self.close(overlay);
      });
    },
  };

  // ESC key closes top overlay
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && window.SleighthandOverlay.stack.length) {
      window.SleighthandOverlay.closeTop();
    }
  });
})();
