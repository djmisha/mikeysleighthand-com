/**
 * scroll-hijack.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Magical scene-by-scene scroll hijacking for the Mikey Sleighthand website.
 *
 * OVERVIEW
 * ────────
 * Every .scene-section element is treated as a full-screen "scene". When the
 * user scrolls, the system intercepts the intent and orchestrates a sequence:
 *
 *   1.  Current scene text content fades OUT
 *   2.  A brief particle sparkle burst fires at the scene boundary
 *   3.  The viewport animates (smoothly) to the target scene
 *   4.  Target scene text content fades IN
 *
 * ANIMATION DIRECTIONS
 * ─────────────────────
 *   Scroll DOWN:
 *     • Current content exits UPWARD    (translateY -20px, opacity → 0)
 *     • Target content enters from BELOW (translateY +20px → 0, opacity → 1)
 *
 *   Scroll UP:
 *     • Current content exits DOWNWARD  (translateY +20px, opacity → 0)
 *     • Target content enters from ABOVE (translateY -20px → 0, opacity → 1)
 *
 * FIRST SCENE
 * ────────────
 *   Content starts hidden on page load. After a short delay it reveals itself
 *   with the "enter from below" animation, giving the impression of magic.
 *
 * LAST SCENE
 * ──────────
 *   Content stays visible; scrolling down is blocked. Scrolling back up
 *   triggers the normal exit-downward animation.
 *
 * TEXT-REVEAL CSS CLASSES  (defined in styles.css)
 * ──────────────────────────────────────────────────
 *   .text-reveal               → hidden below  (opacity 0, translateY +20px)
 *   .text-reveal.visible       → shown          (opacity 1, translateY  0)
 *   .text-reveal.scrolled-past → exit upward   (opacity 0, translateY -20px)
 *   .text-reveal.exiting       → forces zero delay + short duration on exit
 *                                (defined in scene-animations.css)
 *
 * PARTICLE INTEGRATION
 * ─────────────────────
 *   Uses the existing .magic-transition-overlay + .sparkle-rain infrastructure
 *   from transitions.css. The full particlesJS overlay (toggled via the magic
 *   eyes) is left untouched.
 *
 * ACCESSIBILITY
 * ─────────────
 *   • prefers-reduced-motion: animations and particle bursts are skipped;
 *     scene navigation still works via instant scroll.
 *   • Keyboard: ArrowUp/Down, PageUp/Down, Space navigate between scenes.
 *   • Hijacking is suspended while any overlay is open (body.overlay-open).
 *   • Input / textarea focus prevents keyboard hijacking.
 *
 * PUBLIC API
 * ──────────
 *   window.SceneHijack.goTo(index, direction)  — navigate programmatically
 *   window.SceneHijack.getCurrentIndex()        — active scene index
 *   window.SceneHijack.getScenes()              — copy of scenes array
 */
(function () {
  'use strict';

  // ── Configuration ────────────────────────────────────────────────────────────

  var CONFIG = {
    /**
     * How long to wait (ms) after triggering the exit animation before
     * scrolling to the next scene. Should be ≥ the .exiting transition
     * duration defined in scene-animations.css (currently 0.3s = 300ms).
     */
    exitDuration:   350,

    /** Duration (ms) of the smooth viewport-scroll animation. */
    scrollDuration: 380,

    /**
     * Pause (ms) between the scroll completing and the enter animation starting.
     * A brief "blank scene" moment that enhances the magic feel.
     */
    enterDelay:     50,

    /**
     * Minimum milliseconds between successive scene transitions.
     * Prevents accidental double-triggers from trackpad momentum or fast swipes.
     */
    cooldown:      1000,

    /** Minimum finger travel (px) on touchscreen to trigger a scene change. */
    touchThreshold:  45,

    /** Number of sparkle particles spawned per scene-change burst. */
    particleCount:   52,

    /**
     * Delay (ms) after DOMContentLoaded before the first scene reveals itself.
     * This produces the "blank, then magical appearance" effect on page load.
     */
    initialDelay:   500,

    /**
     * Buffer (ms) added after the longest stagger delay when waiting for enter
     * animations to complete.  Components: CSS transition duration (500ms from
     * .text-reveal in styles.css) + 60ms safety buffer = 560ms.
     * If the CSS transition duration changes, update this value accordingly.
     */
    enterCallbackBuffer: 560,

    /**
     * Viewport-alignment tolerance (px).  The hijack only activates when the
     * current scene's top edge is within this many pixels of the viewport top.
     * Prevents the hijack from firing during mid-scene manual scrolling (e.g.,
     * the user dragged the scrollbar) where currentIndex may be stale.
     */
    viewportTolerance: 100,

    /**
     * Mobile breakpoint (px) below which the particle count is halved.
     * Matches the responsive breakpoint used in responsive.css.
     */
    mobileBreakpoint: 768,
  };

  /**
   * Stagger delay values (ms) that MUST match the CSS transition-delay-N
   * utility classes defined in styles.css:
   *   .text-reveal-delay-1 { transition-delay: 0.08s; }
   *   .text-reveal-delay-2 { transition-delay: 0.16s; }
   *   .text-reveal-delay-3 { transition-delay: 0.24s; }
   *
   * If either the CSS values or these JS values change, both must be kept in
   * sync or the enter-animation callback will fire at the wrong time.
   */
  var STAGGER_DELAYS = {
    'text-reveal-delay-1':  80,
    'text-reveal-delay-2': 160,
    'text-reveal-delay-3': 240,
  };

  // ── State ────────────────────────────────────────────────────────────────────

  var scenes             = [];    // Ordered .scene-section elements
  var currentIndex       = 0;     // Index of the scene currently filling the viewport
  var isTransitioning    = false; // Locked during active transitions
  var lastScrollTime     = 0;     // Timestamp of the last completed transition start
  var touchStartY        = 0;     // Y position at the start of a touch gesture
  var prefersReduced     = false; // True when user prefers-reduced-motion
  var transitionSafetyTimer = null; // Guards against isTransitioning getting stuck

  // ── Initialisation ───────────────────────────────────────────────────────────

  function init() {
    prefersReduced = !!(
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    scenes = Array.from(document.querySelectorAll('.scene-section'));
    if (scenes.length === 0) return;

    prepareRevealClasses();
    currentIndex = findClosestScene();

    // Hide native scrollbar — the hijack replaces it completely
    document.body.classList.add('scene-hijack-ready');

    // Page-entry fade: briefly hold opacity:0, then fade in on next paint.
    // This hides any flash of stale content visible during a manual reload.
    // We add the class here (not statically in HTML) so the page degrades
    // gracefully if JS is unavailable.
    document.body.classList.add('page-loading');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.remove('page-loading');
      });
    });

    bindAll();

    // Reveal first scene content after initial delay
    setTimeout(function () {
      revealIn(scenes[currentIndex], 'down', null);
    }, CONFIG.initialDelay);
  }

  // ── Text-reveal class preparation ────────────────────────────────────────────

  /**
   * Ensures every meaningful text element inside every .scene-section has the
   * .text-reveal class (and an appropriate stagger-delay class). Elements that
   * already carry these classes in the HTML markup are left unchanged.
   * All .text-reveal elements are then reset to their initial hidden state.
   */
  function prepareRevealClasses() {
    scenes.forEach(function (scene) {
      // Eyebrow / h1 — first to appear, no delay
      assignIfMissing(scene, 'h1', ['text-reveal']);

      // Main heading — slight delay
      assignIfMissing(scene, 'h2', ['text-reveal', 'text-reveal-delay-1']);

      // Sub-headlines and intro paragraphs
      assignIfMissing(
        scene,
        '.section-intro, .hero-subhead',
        ['text-reveal', 'text-reveal-delay-2']
      );

      // Additional body paragraphs inside hero-content
      assignIfMissing(
        scene,
        '.hero-content > p:not(.hero-subhead):not(.section-intro)',
        ['text-reveal', 'text-reveal-delay-2']
      );

      // CTA buttons — last to appear
      assignIfMissing(scene, '.btn', ['text-reveal', 'text-reveal-delay-3']);

      // Reset every reveal element to its initial hidden state
      scene.querySelectorAll('.text-reveal').forEach(resetRevealEl);
    });
  }

  /** Adds each class in `classes` to every matching element that lacks it. */
  function assignIfMissing(scene, selector, classes) {
    scene.querySelectorAll(selector).forEach(function (el) {
      classes.forEach(function (cls) {
        if (!el.classList.contains(cls)) el.classList.add(cls);
      });
    });
  }

  /** Strips all animation state classes and inline styles from an element. */
  function resetRevealEl(el) {
    el.classList.remove('visible', 'scrolled-past', 'exiting');
    el.style.cssText = '';
  }

  // ── Core navigation ───────────────────────────────────────────────────────────

  /**
   * Transition from the current scene to the scene at `targetIndex`.
   *
   * @param {number}       targetIndex  — zero-based index of the destination scene
   * @param {'up'|'down'}  direction    — scroll direction (determines exit/enter style)
   */
  function navigate(targetIndex, direction) {
    // Guard: locked, cooldown, out-of-bounds, same scene, overlay open
    if (isTransitioning) return;
    if (Date.now() - lastScrollTime < CONFIG.cooldown) return;
    if (targetIndex < 0 || targetIndex >= scenes.length) return;
    if (targetIndex === currentIndex) return;
    if (document.body.classList.contains('overlay-open')) return;

    isTransitioning = true;
    lastScrollTime  = Date.now();

    // Safety guard: if the transition hasn't completed within 4 seconds, force
    // a reset so the page doesn't remain permanently stuck.
    if (transitionSafetyTimer) clearTimeout(transitionSafetyTimer);
    transitionSafetyTimer = setTimeout(function () {
      if (isTransitioning) {
        isTransitioning = false;
        currentIndex = findClosestScene();
        snapToScene(currentIndex);
      }
    }, 4000);

    var fromScene = scenes[currentIndex];
    var toScene   = scenes[targetIndex];

    // Step 1 — animate current scene content OUT
    revealOut(fromScene, direction, function () {

      // Step 2 — optional particle burst at the scene boundary
      if (!prefersReduced) triggerParticleBurst();

      // Step 3 — smoothly scroll the viewport to the target scene
      smoothScrollTo(toScene, function () {
        currentIndex = targetIndex;

        // Step 4 — animate target scene content IN after a brief pause
        setTimeout(function () {
          revealIn(toScene, direction, function () {
            isTransitioning = false;
            if (transitionSafetyTimer) {
              clearTimeout(transitionSafetyTimer);
              transitionSafetyTimer = null;
            }
          });
        }, CONFIG.enterDelay);
      });
    });
  }

  // ── Content animations ────────────────────────────────────────────────────────

  /**
   * Fades a scene's text content OUT.
   *
   *   direction 'down' → exits UPWARD   (adds .scrolled-past)
   *   direction 'up'   → exits DOWNWARD (removes .visible; base CSS handles it)
   *
   * The .exiting class overrides all stagger transition-delays so every element
   * exits simultaneously, giving a crisp unified disappearance.
   */
  function revealOut(scene, direction, callback) {
    var els = getRevealEls(scene);
    if (els.length === 0) { callback(); return; }

    if (prefersReduced) {
      els.forEach(function (el) { el.classList.remove('visible', 'scrolled-past'); });
      callback();
      return;
    }

    els.forEach(function (el) {
      el.classList.add('exiting'); // Override stagger delays → unified exit
      if (direction === 'down') {
        el.classList.remove('visible');
        el.classList.add('scrolled-past');     // translateY(-20px), opacity 0
      } else {
        el.classList.remove('visible', 'scrolled-past'); // base → translateY(+20px), opacity 0
      }
    });

    setTimeout(function () {
      // Clean up helper classes; element sits at hidden base state
      els.forEach(function (el) {
        el.classList.remove('exiting', 'scrolled-past');
      });
      callback();
    }, CONFIG.exitDuration);
  }

  /**
   * Fades a scene's text content IN.
   *
   *   direction 'down' → enters from BELOW (default CSS initial state)
   *   direction 'up'   → enters from ABOVE (requires inline-style bootstrap)
   *
   * The stagger-delay classes (text-reveal-delay-1/2/3) create the cascading
   * appearance that gives each scene a "conjured" feeling.
   */
  function revealIn(scene, direction, callback) {
    var els = getRevealEls(scene);
    if (els.length === 0) { if (callback) callback(); return; }

    if (prefersReduced) {
      els.forEach(function (el) { el.classList.add('visible'); });
      if (callback) scheduleCallback(els, callback);
      return;
    }

    if (direction === 'up') {
      /*
       * "Enter from above" technique:
       *   1. Disable transitions and position elements above the viewport
       *      (translateY -20px, opacity 0) using inline styles.
       *   2. Force a browser reflow so this starting state is committed.
       *   3. Two rAFs cross a frame boundary, ensuring the browser paints
       *      the start frame before we trigger the transition.
       *   4. Clear inline styles (restores CSS-defined transitions) and add
       *      .visible — the browser transitions from -20px → 0, opacity → 1.
       */
      els.forEach(function (el) {
        el.classList.remove('visible', 'scrolled-past', 'exiting');
        el.style.transition = 'none';
        el.style.transform  = 'translateY(-20px)';
        el.style.opacity    = '0';
      });

      // Commit the starting position (force reflow)
      scene.getBoundingClientRect();

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          els.forEach(function (el) {
            el.style.cssText = ''; // Restore CSS-defined transitions
            el.classList.add('visible');
          });
          if (callback) scheduleCallback(els, callback);
        });
      });

    } else {
      /*
       * "Enter from below" — the CSS base state already has translateY(+20px)
       * and opacity 0, so we just need to add .visible and let the transition run.
       */
      els.forEach(function (el) {
        el.classList.remove('scrolled-past', 'exiting');
        el.style.cssText = '';
      });

      scene.getBoundingClientRect();

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          els.forEach(function (el) { el.classList.add('visible'); });
          if (callback) scheduleCallback(els, callback);
        });
      });
    }
  }

  /** Returns all .text-reveal elements in a scene. */
  function getRevealEls(scene) {
    return Array.from(scene.querySelectorAll('.text-reveal'));
  }

  /**
   * Fires `callback` after the last stagger-delayed element has completed its
   * enter transition (stagger delay + CSS transition duration + small buffer).
   */
  function scheduleCallback(els, callback) {
    var maxStagger = 0;
    els.forEach(function (el) {
      Object.keys(STAGGER_DELAYS).forEach(function (cls) {
        if (el.classList.contains(cls) && STAGGER_DELAYS[cls] > maxStagger) {
          maxStagger = STAGGER_DELAYS[cls];
        }
      });
    });
    // Stagger delay (0–450ms) + CSS transition duration (800ms) + buffer
    setTimeout(callback, maxStagger + CONFIG.enterCallbackBuffer);
  }

  // ── Smooth viewport scroll ────────────────────────────────────────────────────

  /**
   * Animates window.scrollY from its current position to the top of `target`
   * using an easeInOutCubic curve, then calls `callback`.
   */
  function smoothScrollTo(target, callback) {
    var startY   = window.pageYOffset;
    var targetY  = target.getBoundingClientRect().top + startY;
    var distance = targetY - startY;
    var duration = CONFIG.scrollDuration;
    var startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    if (prefersReduced) {
      window.scrollTo(0, targetY);
      if (callback) callback();
      return;
    }

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (callback) callback();
      }
    }

    requestAnimationFrame(step);
  }

  // ── Particle burst ─────────────────────────────────────────────────────────────

  /**
   * Returns (creating on first call) a transparent fixed-position container
   * that sits above all scene content but below ParlourOverlay overlays.
   * z-index 9999 places it above scenes, hero sparkles, and particles-js (999)
   * but below the overlay stack which starts at 10100.
   *
   * Using a dedicated transparent layer (rather than the .magic-transition-overlay
   * which has a black background) means sparkles appear on top of the scene
   * transition while the background change is visible underneath.
   */
  function getParticleLayer() {
    var el = document.getElementById('scene-particle-layer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'scene-particle-layer';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'width:100%',
        'height:100%',
        'z-index:9999',
        'pointer-events:none',
        'background:transparent',
        'overflow:hidden',
      ].join(';');
      document.body.appendChild(el);
    }
    return el;
  }

  /**
   * Spawns a brief shower of gold and white sparkle-rain particles that float
   * on top of the scene transition.  Particles are spread across the full
   * viewport (both axes) for a dramatic all-scene burst.
   * Particle count is halved on mobile to preserve performance.
   */
  function triggerParticleBurst() {
    var layer = getParticleLayer();

    var count = window.innerWidth < CONFIG.mobileBreakpoint
      ? Math.ceil(CONFIG.particleCount / 2)
      : CONFIG.particleCount;

    for (var i = 0; i < count; i++) {
      (function (idx) {
        setTimeout(function () {
          var s   = document.createElement('div');
          s.className = 'sparkle-rain';
          var size    = (1.5 + Math.random() * 3.5) + 'px';
          // Spread across the full viewport width and height
          s.style.left    = (Math.random() * 100) + '%';
          s.style.top     = (Math.random() * 95) + '%';  // full scene height
          s.style.width   = size;
          s.style.height  = size;
          s.style.background = Math.random() > 0.45 ? '#ffd700' : '#ffffff';
          // Vary fall distance and direction so particles scatter in all directions
          var fallDir = Math.random() > 0.5 ? 1 : -1;   // up or down
          s.style.setProperty('--fall-distance', (fallDir * (60 + Math.random() * 160)) + 'px');
          s.style.setProperty('--drift-x',       ((Math.random() - 0.5) * 140) + 'px');
          s.style.setProperty('--fall-duration',  (0.9 + Math.random() * 1.1) + 's');
          layer.appendChild(s);
          setTimeout(function () { if (s.parentNode) s.remove(); }, 2500);
        }, idx * 12);  // slightly faster stagger to feel more simultaneous
      })(i);
    }
  }

  // ── Event bindings ────────────────────────────────────────────────────────────

  function bindAll() {
    // Wheel / trackpad — capture phase, passive:false to allow preventDefault
    window.addEventListener('wheel', onWheel, { passive: false });

    // Touch (swipe up/down)
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend',   onTouchEnd,   { passive: false });

    // Keyboard navigation
    window.addEventListener('keydown', onKeyDown);

    // Intercept anchor-link clicks that target scene sections
    document.addEventListener('click', onAnchorClick, true);

    // Recovery: when the page becomes visible again after a hidden tab switch,
    // check whether a transition was left mid-flight and recover if needed.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && isTransitioning) {
        // Allow a brief grace period for in-flight rAF/setTimeout callbacks to
        // complete before forcing a reset.
        setTimeout(function () {
          if (isTransitioning) {
            isTransitioning = false;
            if (transitionSafetyTimer) {
              clearTimeout(transitionSafetyTimer);
              transitionSafetyTimer = null;
            }
            currentIndex = findClosestScene();
            snapToScene(currentIndex);
          }
        }, 600);
      }
    });
  }

  function onWheel(e) {
    // Don't steal events that are primarily horizontal — these are meant for
    // carousels (FAQ, Testimonials) that scroll left/right within a scene.
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    if (!isViewportAtScene()) {
      // Viewport has drifted away from the current scene (e.g. after an overlay
      // or a stuck transition).  Snap back to the closest scene to recover.
      recoverToClosestScene();
      return;
    }
    e.preventDefault();
    var dir = e.deltaY > 0 ? 'down' : 'up';
    navigate(currentIndex + (dir === 'down' ? 1 : -1), dir);
  }

  function onTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }

  function onTouchEnd(e) {
    if (!isViewportAtScene()) return;
    var dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) < CONFIG.touchThreshold) return;
    e.preventDefault();
    var dir = dy > 0 ? 'down' : 'up';
    navigate(currentIndex + (dir === 'down' ? 1 : -1), dir);
  }

  function onKeyDown(e) {
    // Never steal keyboard from form fields
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!isViewportAtScene()) return;

    var dir = null;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') dir = 'down';
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')                    dir = 'up';
    if (!dir) return;

    e.preventDefault();
    navigate(currentIndex + (dir === 'down' ? 1 : -1), dir);
  }

  /**
   * Intercepts anchor clicks whose href targets a .scene-section element,
   * routing them through the animated hijack instead of the native/jQuery
   * smooth-scroll handler.  Clicks on non-scene links pass through normally.
   */
  function onAnchorClick(e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link || link.classList.contains('open-contact-form')) return;

    var hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    var target = document.querySelector(hash);
    if (!target) return;

    var idx = scenes.indexOf(target);
    if (idx === -1) return; // Not a scene — let default handler proceed

    e.preventDefault();
    e.stopPropagation();
    navigate(idx, idx > currentIndex ? 'down' : 'up');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  /**
   * Returns true when the viewport is currently aligned with the active scene
   * (i.e., the scene's top edge is within ±CONFIG.viewportTolerance px of the
   * viewport's top edge).  This prevents the hijack from triggering while the
   * user has manually scrolled to a mid-scene position (e.g., via scrollbar).
   */
  function isViewportAtScene() {
    if (!scenes.length || currentIndex >= scenes.length) return false;
    var rect = scenes[currentIndex].getBoundingClientRect();
    return Math.abs(rect.top) < CONFIG.viewportTolerance;
  }

  /**
   * Snaps the viewport to the scene that is currently most visible and updates
   * currentIndex.  Called when the viewport has drifted out of alignment with
   * the active scene (e.g. after an overlay or a stuck/partial transition).
   */
  function recoverToClosestScene() {
    if (isTransitioning) return;
    var idx = findClosestScene();
    currentIndex = idx;
    snapToScene(idx);
  }

  /**
   * Returns the index of the scene that currently occupies the most viewport
   * space.  Used to initialise `currentIndex` at page load.
   */
  function findClosestScene() {
    var bestIdx     = 0;
    var bestOverlap = -Infinity;
    var vh          = window.innerHeight;

    scenes.forEach(function (scene, idx) {
      var r       = scene.getBoundingClientRect();
      var overlap = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestIdx     = idx;
      }
    });

    return bestIdx;
  }

  /**
   * Instantly snaps the viewport to the scene at `idx` without animation.
   * Used by the recovery guard when a transition gets stuck.
   */
  function snapToScene(idx) {
    if (!scenes[idx]) return;
    window.scrollTo(0, scenes[idx].getBoundingClientRect().top + window.pageYOffset);
  }

  // ── Public API ─────────────────────────────────────────────────────────────────

  window.SceneHijack = {
    /** Navigate to a specific scene by index. */
    goTo: navigate,
    /** Returns the index of the currently active scene. */
    getCurrentIndex: function () { return currentIndex; },
    /** Returns a shallow copy of the scenes array. */
    getScenes: function () { return scenes.slice(); },
    /** Force-reset the transition lock (emergency recovery). */
    reset: function () {
      isTransitioning = false;
      if (transitionSafetyTimer) {
        clearTimeout(transitionSafetyTimer);
        transitionSafetyTimer = null;
      }
      currentIndex = findClosestScene();
      snapToScene(currentIndex);
    },
  };

  // ── Bootstrap ─────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
