window.setupOwlChatbot = function () {
  let messageCount = 0;
  
  const genericResponses = [
    "Intriguing question. Mikey's performances blend refined charm with impossible moments—perfect for elevating any gathering.",
    "Ah, you're curious. That's how all great mysteries begin. Mikey specializes in sleight of hand that defies explanation.",
    "A wise inquiry. What makes Mikey's magic unique is the intimacy—cards and coins transforming right before your eyes.",
    "Hmm, let me conjure an answer for you: Mikey brings wonder to private events, weddings, and distinguished gatherings across San Diego or any destination. Travel arrangements available.",
    "Excellent timing for such a question. Mikey's close-up illusions are crafted for those who appreciate artistry over spectacle.",
    "I see you're drawn to the mysterious. Mikey's sleight of hand turns ordinary moments into unforgettable experiences.",
    "A thoughtful question indeed. Every performance is tailored—no two events witness the same impossibilities.",
    "You ask well. Mikey's magic isn't about tricks; it's about creating moments your guests will recount for years.",
    "Interesting... What you're really asking is how to bring true wonder to your event. The answer is simpler than you think.",
    "I sense you're planning something special. Mikey's performances transform gatherings into occasions people remember forever."
  ];
  
  const farewellResponses = [
    "Ah, I must vanish now—much like one of Mikey's cards. For bookings and genuine mysteries, use the inquiry form. *disappears in a shimmer*",
    "Three exchanges... time for me to pull my disappearing act. Ready to witness real magic? Book Mikey. *fades into shadow*",
    "And with that, I take my leave—a proper magician never overstays. Your next impossible moment awaits... book your event. *vanishes*",
    "Three questions answered, and now I must fly. For Mikey's artistry at your event, you know what to do. *dissolves into moonlight*"
  ];
  
  const owlResponses = {
    hello: "Good evening. Ready to witness the impossible?",
    hi: "Greetings, seeker of wonder.",
    booking: "To reserve Mikey for your event, simply click the 'Inquire About Your Event' button at the bottom of the page. Fill out the form with your event details—date, venue, and vision. Mikey will follow up personally.",
    pricing: "Investment: $5000 per event. For what you receive—two hours of impossible moments, conversations your guests will repeat for years, and artistry honed over decades—it's exceptional value. True wonder is priceless.",
    price: "Investment: $5000 per event. For what you receive—two hours of impossible moments, conversations your guests will repeat for years, and artistry honed over decades—it's exceptional value. True wonder is priceless.",
    cost: "Investment: $5000 per event. For what you receive—two hours of impossible moments, conversations your guests will repeat for years, and artistry honed over decades—it's exceptional value. True wonder is priceless.",
    magic:
      "True magic isn't about secrets—it's about creating moments that linger. Mikey's sleight of hand does exactly that, right before your eyes.",
    joke: function () {
      const jokes = [
        "Why don't magicians reveal their secrets? They're afraid no one will conjure up a laugh!",
        "What do you call a magician who lost their magic? Ian.",
        "Did you hear about the magician who was walking down the stairs? He tripped and fell into a trick!",
        "Why did the magician become a gardener? They wanted to try their hand at plant-based magic.",
        "How do magicians pay their bills? With trick-le down economics!",
        "A magician was driving down the road... then he turned into a driveway.",
        "What did the magician say when his rabbit disappeared? 'Hare today, gone tomorrow!'",
        "Why did the magician join the construction crew? To learn about building suspense.",
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    },
  };

  $(".owl-avatar")
    .off("click")
    .on("click", function (e) {
      e.stopPropagation();
      $(".chat-window").fadeToggle(300);
      pulseOwl();
      $(".suggestion-tags").show();
    });

  $(".close-chat")
    .off("click")
    .on("click", function (e) {
      e.stopPropagation();
      $(".chat-window").fadeOut(300);
      setTimeout(function () {
        $(".chat-messages .message:not(:first-child)").remove();
        $(".suggestion-tags").show();
        messageCount = 0; // Reset counter when manually closing
      }, 300);
    });

  $(".send-btn").off("click").on("click", sendMessage);
  $(".chat-input input")
    .off("keypress")
    .on("keypress", function (e) {
      if (e.which === 13) {
        sendMessage();
      }
    });

  function sendMessage() {
    const userInput = $(".chat-input input").val().trim();
    if (userInput === "") return;
    
    messageCount++;
    
    $(".chat-messages").append(`<div class="message user">${userInput}</div>`);
    $(".chat-input input").val("");
    $(".suggestion-tags").hide();
    $(".chat-messages").scrollTop($(".chat-messages")[0].scrollHeight);
    
    setTimeout(function () {
      let botResponse;
      
      // After 3 messages, owl says farewell and disappears
      if (messageCount >= 3) {
        botResponse = farewellResponses[Math.floor(Math.random() * farewellResponses.length)];
        $(".chat-messages").append(
          `<div class="message bot">${botResponse}</div>`
        );
        $(".chat-messages").scrollTop($(".chat-messages")[0].scrollHeight);
        
        // Trigger disappearing sequence after allowing time to read
        setTimeout(function() {
          owlDisappear();
        }, 4000);
      } else {
        botResponse = getBotResponse(userInput.toLowerCase());
        $(".chat-messages").append(
          `<div class="message bot">${botResponse}</div>`
        );
        if (
          botResponse.includes("inquiry form") ||
          botResponse.includes("anything else")
        ) {
          setTimeout(() => {
            $(".suggestion-tags").show();
            $(".chat-messages").scrollTop($(".chat-messages")[0].scrollHeight);
          }, 500);
        }
        $(".chat-messages").scrollTop($(".chat-messages")[0].scrollHeight);
      }
      
      pulseOwl();
    }, 800);
  }

  function getBotResponse(input) {
    // Check for specific keywords first
    for (let keyword in owlResponses) {
      if (input.includes(keyword)) {
        return typeof owlResponses[keyword] === "function"
          ? owlResponses[keyword]()
          : owlResponses[keyword];
      }
    }
    // Return random generic response
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }
  
  function owlDisappear() {
    // Close chat window
    $(".chat-window").fadeOut(300);
    
    // Slide owl off screen to the right and keep it gone
    $(".owl-chatbot").animate({
      right: "-100px",
      opacity: 0
    }, 800, function() {
      // Hide the owl completely for this session
      $(".owl-chatbot").hide();
    });
  }

  function pulseOwl() {
    $(".owl-emoji").css("transform", "scale(1.2)");
    setTimeout(function () {
      $(".owl-emoji").css("transform", "scale(1)");
    }, 200);
  }

  if (window.owlPulseInterval) clearInterval(window.owlPulseInterval);
  if (window.owlShakeTimeout) clearTimeout(window.owlShakeTimeout);

  pulseOwl();

  window.owlPulseInterval = setInterval(function () {
    if (Math.random() < 0.2) {
      pulseOwl();
    }
  }, 5000);

  function shakeOwl() {
    if ($(".chat-window").is(":hidden")) {
      const shakeSequence = [
        { right: "15px" },
        { right: "25px" },
        { right: "15px" },
        { right: "25px" },
        { right: "20px" },
      ];
      const shakeDurations = [100, 100, 100, 100, 100];
      let sequenceIndex = 0;
      function nextShake() {
        if (sequenceIndex < shakeSequence.length) {
          $(".owl-chatbot").animate(
            shakeSequence[sequenceIndex],
            shakeDurations[sequenceIndex],
            function () {
              sequenceIndex++;
              nextShake();
            }
          );
        } else {
          $(".owl-chatbot")
            .animate({ right: "18px" }, 150)
            .animate({ right: "20px" }, 150);
          setTimeout(function () {
            pulseOwl();
          }, 100);
        }
      }
      nextShake();
    }
  }

  function setupRandomMovements() {
    function scheduleNextShake() {
      const minDelay = 8000;
      const maxDelay = 15000;
      const randomDelay =
        Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
      window.owlShakeTimeout = setTimeout(function () {
        shakeOwl();
        scheduleNextShake();
      }, randomDelay);
    }
    if (
      $(".owl-chatbot").length > 0 &&
      !$(".owl-chatbot").data("randomMovementsSetup")
    ) {
      $(".owl-chatbot")
        .css({
          bottom: "20px",
          right: "20px",
          opacity: 1,
        })
        .data("randomMovementsSetup", true);
      scheduleNextShake();
    }
  }
  setupRandomMovements();

  $(".owl-chatbot")
    .off("mouseenter mouseleave")
    .hover(
      function () {
        $(this).addClass("owl-hover");
      },
      function () {
        $(this).removeClass("owl-hover");
      }
    );

  $(".tag")
    .off("click")
    .on("click", function () {
      const query = $(this).data("query");
      const tagText = $(this).text();
      $(".chat-input input").val(tagText);
      sendMessage();
      $(".suggestion-tags").hide();
    });
};
