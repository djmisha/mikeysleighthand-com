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
