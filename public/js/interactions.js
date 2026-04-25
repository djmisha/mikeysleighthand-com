window.setupEventCardHover = function () {
  $(".event-card")
    .off("mouseenter mouseleave")
    .hover(
      function () {
        $(this).find("h3").css("color", "#c41212");
      },
      function () {
        $(this).find("h3").css("color", "");
      }
    );
};

window.setupArtFormHover = function () {
  $(".art-form")
    .off("mouseenter mouseleave")
    .hover(
      function () {
        $(this).find(".art-icon").addClass("active");
      },
      function () {
        $(this).find(".art-icon").removeClass("active");
      }
    );

  $(window)
    .off("scroll.artform")
    .on("scroll.artform", function () {
      var scrollPosition = $(this).scrollTop();
      if ($("#magic-arts").length) {
        var sectionPosition = $("#magic-arts").offset().top;
      }
    });
};
