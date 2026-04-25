window.setupMembershipAnimations = function () {
  $(window)
    .off("scroll.membership")
    .on("scroll.membership", function () {
      var scrollPosition = $(this).scrollTop();

      if ($(".membership-section").length) {
        var sectionPosition = $(".membership-section").offset().top;

        if (scrollPosition > sectionPosition - 500) {
          $(".benefit").each(function (i) {
            setTimeout(
              function (element) {
                $(element).addClass("visible");
              },
              i * 200,
              this
            );
          });
        }
      }
    });

  $(".benefit").addClass("benefit-animation");
};

window.setupHeaderEyes = function () {
  var eyes = $(".magic-eyes");
  if (!eyes.length) return;

  // The 4 corner positions (as [top/bottom, left/right, value, value])
  var CORNERS = [
    { top: "30px",  bottom: "auto", left: "30px",  right: "auto" },  // top-left
    { top: "30px",  bottom: "auto", left: "auto",  right: "30px" },  // top-right
    { top: "auto",  bottom: "40px", left: "30px",  right: "auto" },  // bottom-left
    { top: "auto",  bottom: "40px", left: "auto",  right: "30px" },  // bottom-right
  ];

  var SCROLL_THRESHOLD = 100;   // px below top to show eyes
  var CYCLE_INTERVAL   = 60000; // ms between relocations (1 minute)

  var currentCornerIndex = -1;  // will be set on first show
  var cycleTimer = null;
  var isVisible = false;

  // Make eyes fixed-position
  eyes.css({
    position: "fixed",
    transform: "none",
    transition: "opacity 0.6s ease",
    opacity: "0",
    display: "flex",
    zIndex: "9900",
  });

  function getRandomCorner(exclude) {
    var available = CORNERS.map(function(_, i) { return i; }).filter(function(i) { return i !== exclude; });
    // Fallback to any corner if somehow available is empty
    if (!available.length) return 0;
    return available[Math.floor(Math.random() * available.length)];
  }

  function placeEyesAtCorner(index) {
    var c = CORNERS[index];
    eyes.css({
      top: c.top,
      bottom: c.bottom,
      left: c.left,
      right: c.right,
    });
    currentCornerIndex = index;
  }

  function showEyes() {
    if (isVisible) return;
    isVisible = true;
    var newCorner = getRandomCorner(currentCornerIndex);
    placeEyesAtCorner(newCorner);
    eyes.css("opacity", "1");
    startCycle();
  }

  function hideEyes(immediate) {
    if (!isVisible) return;
    isVisible = false;
    if (immediate) {
      eyes.css({ opacity: "0", transition: "none" });
      setTimeout(function() { eyes.css("transition", "opacity 0.6s ease"); }, 50);
    } else {
      eyes.css("opacity", "0");
    }
    stopCycle();
  }

  function relocate() {
    // Fade out, move to new corner, fade back in
    eyes.css("opacity", "0");
    setTimeout(function () {
      if (!isVisible) return; // aborted during fade
      var newCorner = getRandomCorner(currentCornerIndex);
      placeEyesAtCorner(newCorner);
      eyes.css("opacity", "1");
    }, 650);
  }

  function startCycle() {
    stopCycle();
    cycleTimer = setInterval(relocate, CYCLE_INTERVAL);
  }

  function stopCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }
  }

  // Scroll listener — show/hide based on threshold
  $(window).off("scroll.eyes").on("scroll.eyes", function () {
    var scrollY = $(this).scrollTop();
    if (scrollY >= SCROLL_THRESHOLD) {
      showEyes();
    } else {
      hideEyes(false);
    }
  });

  // Initial check (if page starts scrolled)
  if ($(window).scrollTop() >= SCROLL_THRESHOLD) {
    showEyes();
  }

  // Mouse-tracking: pupils follow cursor
  $(document).off("mousemove.headerEyes").on("mousemove.headerEyes", function (e) {
    if (!isVisible) return;
    $(".magic-eyes .pupil").each(function () {
      var pupil = $(this);
      var eye = pupil.parent();
      var eyeRect = eye[0].getBoundingClientRect();
      var eyeCenterX = eyeRect.left + eyeRect.width / 2;
      var eyeCenterY = eyeRect.top + eyeRect.height / 2;
      var deltaX = e.clientX - eyeCenterX;
      var deltaY = e.clientY - eyeCenterY;
      var angle = Math.atan2(deltaY, deltaX);
      var eyeRadius = eye.width() / 2;
      var maxDistance = eyeRadius - pupil.width() / 2;
      var distance = Math.min(
        Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 5,
        maxDistance
      );
      var pupilX = Math.cos(angle) * distance;
      var pupilY = Math.sin(angle) * distance;
      pupil.css("transform", "translate(calc(-50% + " + pupilX + "px), calc(-50% + " + pupilY + "px))");
    });
  });

  // Random blinking
  if (window.blinkInterval) clearInterval(window.blinkInterval);

  function randomBlink() {
    var randomDelay = Math.floor(Math.random() * 4000) + 2000;
    window.blinkInterval = setTimeout(function () {
      $(".magic-eyes .eye").addClass("blinking");
      setTimeout(function () {
        $(".magic-eyes .eye").removeClass("blinking");
      }, 500);
      randomBlink();
    }, randomDelay);
  }

  randomBlink();
};
