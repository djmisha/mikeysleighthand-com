window.createSparkle = function () {
  const sparkle = $("<div>", { class: "magic-sparkle" });
  const xPos = Math.random() * window.innerWidth;
  const yPos = Math.random() * window.innerHeight;
  const size = Math.random() * 15 + 3;
  const colors = [
    "#d4ac0d",
    "#8b0000",
    "#fff",
    "#ffc107",
    "#ff9800",
    "#e91e63",
    "#9c27b0",
    "#3f51b5",
    "#2196f3",
    "#4caf50",
    "#ff5722",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  let shape = "circle";
  const shapeRandom = Math.random();
  let rotation = Math.random() * 360;
  let extraCSS = {};

  if (shapeRandom > 0.7) {
    shape = "star";
    extraCSS = {
      clipPath:
        "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      backgroundColor: "transparent",
      border: `2px solid ${color}`,
    };
  } else if (shapeRandom > 0.4) {
    shape = "diamond";
    extraCSS = {
      transform: `rotate(${rotation}deg)`,
      backgroundColor: "transparent",
      border: `2px solid ${color}`,
    };
  }
  const animationDuration = Math.random() * 800 + 600;
  const animationDelay = Math.random() * 300;
  sparkle.css({
    left: xPos + "px",
    top: yPos + "px",
    width: size + "px",
    height: size + "px",
    backgroundColor: color,
    borderRadius: shape === "circle" ? "50%" : shape === "diamond" ? "0%" : "",
    opacity: 0,
    position: "fixed",
    zIndex: 9999,
    pointerEvents: "none",
    animation: `sparkle ${animationDuration}ms ${animationDelay}ms forwards`,
    boxShadow: `0 0 ${size / 3}px ${color}`,
    ...extraCSS,
  });
  sparkle.appendTo("body");
  setTimeout(function () {
    sparkle.remove();
  }, animationDuration + animationDelay);
};

window.createMagicParticle = function () {
  const particle = $("<div>", { class: "magic-particle" });
  const xPos = Math.random() * window.innerWidth;
  const yPos = Math.random() * window.innerHeight;
  const size = Math.random() * 8 + 2;
  const colors = [
    "#d4ac0d",
    "#ffd700",
    "#ffcc00",
    "#8b0000",
    "#ff9800",
    "#fff",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const duration = Math.random() * 2000 + 1000;
  particle.css({
    position: "fixed",
    left: xPos + "px",
    top: yPos + "px",
    width: size + "px",
    height: size + "px",
    backgroundColor: color,
    borderRadius: "50%",
    boxShadow: `0 0 ${size}px ${color}`,
    opacity: 0,
    zIndex: 10001,
    pointerEvents: "none",
  });
  $("body").append(particle);
  const destX = Math.random() * window.innerWidth;
  const destY = Math.random() * window.innerHeight;
  particle.animate({ opacity: 1 }, 200, function () {
    $(this).animate(
      { left: destX + "px", top: destY + "px", opacity: 0.7 },
      duration,
      function () {
        $(this).animate({ opacity: 0 }, 300, function () {
          $(this).remove();
        });
      }
    );
  });
};

window.setupMagicTricks = function () {
  // Clean up any stray magic areas outside overlay
  if (
    $("#magic-area").length > 0 &&
    !$("#magic-area").closest("#magic-trick-overlay").length
  ) {
    $("#magic-area").remove();
  }

  // Keep the old #magic-trick-overlay for compatibility / fallback
  if (
    $("#magic-trick-overlay").length === 0 ||
    $("#magic-trick-overlay").children().length === 0
  ) {
    if ($("#magic-trick-overlay").length > 0) {
      $("#magic-trick-overlay").remove();
    }
    $("<div>", {
      id: "magic-trick-overlay",
      html: `<div id="magic-area"></div>`,
    }).appendTo("body");
  }

  // Use event delegation so footer + nav + any cloned elements all work
  $(document)
    .off("click.doMagic")
    .on("click.doMagic", ".do-magic", function (e) {
      e.preventDefault();
      startMagicTrick();
    });

  $(document)
    .off("click.tellSecret")
    .on("click.tellSecret", ".tell-secret", function (e) {
      e.preventDefault();
      showSecretOverlay();
    });

  $(".magic-eyes")
    .off("click.sparkle")
    .on("click.sparkle", function (e) {
      e.preventDefault();
      // Run the current effect from the extensible effects array
      var effect = window._eyeEffects && window._eyeEffects.length
        ? window._eyeEffects[Math.floor(Math.random() * window._eyeEffects.length)]
        : null;
      if (effect) {
        effect();
      } else {
        for (let i = 0; i < 300; i++) {
          window.createSparkle();
        }
      }
    });

  // Expose magic functions so navigation.js overlay can call them
  window._startMagicTrick = startMagicTrick;
  window._showSecretOverlay = showSecretOverlay;

  // Extensible effects array — add new effects here in the future
  window._eyeEffects = window._eyeEffects || [
    function sparkleEffect() {
      for (let i = 0; i < 300; i++) window.createSparkle();
    }
  ];

  function startMagicTrick() {
    const firstSetOfCards = ["🂢", "🃄", "🃙", "🂦", "🃓"];
    const secondSetOfCards = ["🂣", "🃅", "🂧", "🃉", "🃂"];

    var step1Html = `
      <div id="magic-area">
        <h2>Mind Reading Magic Trick</h2>
        <p>Think of ONE card below. Don't click it—just remember it clearly.</p>
        <div class="cards-container">
          ${firstSetOfCards.map((card) => `<span class="card">${card}</span>`).join("")}
        </div>
        <p>Got your card in mind? Let me read your thoughts...</p>
        <button class="btn" id="start-mind-reading">I've chosen my card</button>
      </div>
    `;

    if (window.ParlourOverlay) {
      var overlay = window.ParlourOverlay.open(step1Html);

      overlay.querySelector("#start-mind-reading").addEventListener("click", function () {
        for (let i = 0; i < 100; i++) window.createSparkle();

        overlay.querySelector(".parlour-overlay-body").innerHTML = `
          <div id="magic-area">
            <h2>Reading your mind...</h2>
            <div class="mind-reading-animation">
              <span class="crystal-ball">🔮</span>
              <div id="reading-text">Focusing...</div>
            </div>
          </div>
        `;

        const readingMessages = [
          "Focusing...",
          "I sense your choice...",
          "Ah, I can see it clearly now...",
          "Getting the image...",
        ];
        let messageIndex = 0;
        const readingInterval = setInterval(function () {
          const readingEl = overlay.querySelector("#reading-text");
          if (readingEl) {
            messageIndex = (messageIndex + 1) % readingMessages.length;
            readingEl.textContent = readingMessages[messageIndex];
          }
        }, 1000);

        setTimeout(function () {
          clearInterval(readingInterval);
          overlay.querySelector(".parlour-overlay-body").innerHTML = `
            <div id="magic-area">
              <p>Voilà! Look at the cards now.</p>
              <h2>Your card has vanished!</h2>
              <div class="cards-container">
                ${secondSetOfCards.map((card) => `<span class="card">${card}</span>`).join("")}
              </div>
              <button class="btn" id="close-magic-trick">Amazing!</button>
            </div>
          `;
          for (let i = 0; i < 150; i++) window.createSparkle();

          overlay.querySelector("#close-magic-trick").addEventListener("click", function () {
            window.ParlourOverlay.close(overlay);
          });
        }, 6000);
      });
    } else {
      // Fallback
      $("#magic-trick-overlay").addClass("visible");
      $("body").css("overflow", "hidden");
      $("#magic-trick-overlay #magic-area").html(`
        <h2>Mind Reading Magic Trick</h2>
        <p>Think of ONE card below. Don't click it—just remember it clearly.</p>
        <div class="cards-container">
          ${firstSetOfCards.map((card) => `<span class="card">${card}</span>`).join("")}
        </div>
        <p>Got your card in mind? Let me read your thoughts...</p>
        <button class="content-btn" id="start-mind-reading">I've chosen my card</button>
      `);
      $("#start-mind-reading").off("click").on("click", function () {
        for (let i = 0; i < 100; i++) window.createSparkle();
        $("#magic-trick-overlay #magic-area").html(`
          <h2>Reading your mind...</h2>
          <div class="mind-reading-animation">
            <span class="crystal-ball">🔮</span>
            <div id="reading-text">Focusing...</div>
          </div>
        `);
        const readingMessages = ["Focusing...", "I sense your choice...", "Ah, I can see it clearly now...", "Getting the image..."];
        let messageIndex = 0;
        const readingInterval = setInterval(function () {
          messageIndex = (messageIndex + 1) % readingMessages.length;
          $("#reading-text").text(readingMessages[messageIndex]);
        }, 1000);
        setTimeout(function () {
          clearInterval(readingInterval);
          $("#magic-trick-overlay #magic-area").html(`
            <p>Voilà! Look at the cards now.</p>
            <h2>Your card has vanished!</h2>
            <div class="cards-container">
              ${secondSetOfCards.map((card) => `<span class="card">${card}</span>`).join("")}
            </div>
            <button class="content-btn" id="close-magic-trick">Amazing!</button>
          `);
          for (let i = 0; i < 150; i++) window.createSparkle();
          $("#close-magic-trick").off("click").on("click", function () {
            $("#magic-trick-overlay").removeClass("visible");
            setTimeout(() => { $("body").css("overflow", ""); }, 500);
          });
        }, 6000);
      });
    }
  }

  function showSecretOverlay() {
    var secretHtml = `
      <div class="secret-content">
        <h2 class="secret-heading">
          The Magician is not keeping the secret <span class="emphasis">from</span> you.<br>
          The Magician is keeping the secret <span class="emphasis">for</span> you.
        </h2>
        <p class="secret-explanation">
          Magic is the art of wonder and astonishment. By preserving its mysteries,
          magicians ensure that you can experience the genuine joy of being amazed—the very
          feeling that makes magic special. When we safeguard these secrets, we're protecting
          your opportunity to experience true wonder in a world that too rarely surprises us.
        </p>
        <button class="btn secret-close-btn">Enchanted &amp; Ready</button>
      </div>
    `;

    if (window.ParlourOverlay) {
      for (let i = 0; i < 200; i++) {
        window.createMagicParticle();
      }
      var overlay = window.ParlourOverlay.open(secretHtml);
      overlay.querySelector(".secret-close-btn").addEventListener("click", function () {
        window.ParlourOverlay.close(overlay);
      });
    } else {
      if ($("#secret-overlay").length === 0) {
        const overlay = $("<div>", {
          id: "secret-overlay",
          class: "secret-overlay",
          html: secretHtml,
        });
        $("body").append(overlay);
      }
      $("#secret-overlay").addClass("visible");
      $("body").css("overflow", "hidden");
      for (let i = 0; i < 200; i++) {
        window.createMagicParticle();
      }

      $(".secret-close, .content-btn, #secret-overlay")
        .off("click.secretClose")
        .on("click.secretClose", function (event) {
          if (
            $(event.target).is("#secret-overlay") ||
            $(event.target).is(".secret-close") ||
            $(event.target).is(".content-btn")
          ) {
            $("#secret-overlay").removeClass("visible");
            setTimeout(() => {
              $("body").css("overflow", "");
              $("#secret-overlay").remove();
            }, 500);
          }
        });
      $(document)
        .off("keydown.secret")
        .on("keydown.secret", function (e) {
          if (e.key === "Escape") {
            $("#secret-overlay").removeClass("visible");
            setTimeout(() => {
              $("body").css("overflow", "");
              $(document).off("keydown.secret");
              $("#secret-overlay").remove();
            }, 500);
          }
        });
    }
  }
};
