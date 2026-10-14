(function () {
  const header = document.getElementById("ihHeader");
  const toggle = document.getElementById("ihMenuToggle");
  const nav = document.getElementById("ihNavLinks");

  if (!header || !toggle || !nav) return;

  const navLinks = nav.querySelectorAll(".ih-nav-link");
  const allLinks = nav.querySelectorAll("a");

  /* OPEN / CLOSE MOBILE MENU */
  function setMenu(open) {
    nav.classList.toggle("ih-menu-open", open);
    toggle.classList.toggle("ih-open", open);

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu"
    );

    document.body.classList.toggle("ih-menu-active", open);
  }

  toggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("ih-menu-open"));
  });

  /* CLOSE MENU AFTER CLICK */
  allLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);

      const href = link.getAttribute("href");

      if (href && href.startsWith("#")) {
        const target = document.querySelector(href);

        if (target) {
          navLinks.forEach(function (item) {
            item.classList.toggle(
              "ih-active",
              item.getAttribute("href") === href
            );
          });
        }
      }
    });
  });

  /* CLOSE ON ESCAPE */
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });

  /* CLOSE ON OUTSIDE CLICK */
  document.addEventListener("click", function (event) {
    if (
      nav.classList.contains("ih-menu-open") &&
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  /* HEADER SCROLL EFFECT */
  function handleScroll() {
    header.classList.toggle("ih-scrolled", window.scrollY > 30);
  }

  handleScroll();

  window.addEventListener("scroll", handleScroll, {
    passive: true
  });

  /* ACTIVE SECTION HIGHLIGHT */
  const sections = document.querySelectorAll(
    "#home, #about, #services, #projects, #testimonials, #contact"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const id = entry.target.id;

          navLinks.forEach(function (link) {
            link.classList.toggle(
              "ih-active",
              link.getAttribute("href") === "#" + id
            );
          });
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px"
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
})();



/* scroll revel animaction */
(function () {
  const revealElements = document.querySelectorAll(".ih-reveal");

  if (!revealElements.length) return;

  if (!("IntersectionObserver" in window)) {
    // Fallback: show everything if IntersectionObserver isn't supported
    revealElements.forEach(function (el) {
      el.classList.add("ih-revealed");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = parseInt(el.getAttribute("data-delay") || "0", 10);

        setTimeout(function () {
          el.classList.add("ih-revealed");
        }, delay);

        observer.unobserve(el);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    }
  );

  revealElements.forEach(function (el) {
    observer.observe(el);
  });
})();



/* ==========================================
   INTERIOR HUB — TESTIMONIALS MULTI-CARD SLIDER
   Desktop: 3 cards | Tablet: 2 cards | Mobile: 1 card
========================================== */

(function () {
  "use strict";

  const slider = document.querySelector(".ih-testimonials-grid");
  if (!slider) return;

  const cards = slider.querySelectorAll(".ih-testimonial-card");
  if (cards.length < 2) return;

  /* ===== CONFIG ===== */
  const AUTOPLAY_DELAY = 5000;
  const TRANSITION_DURATION = 900;
  const SWIPE_THRESHOLD = 50;

  let currentIndex = 0;
  let autoplayTimer = null;
  let isPaused = false;
  let isTransitioning = false;
  let dotsContainer = null;

  /* ===== VISIBLE COUNT BY SCREEN SIZE ===== */
  function getVisibleCount() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  /* ===== MAX START INDEX ===== */
  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  /* ===== DISTANCE FOR ONE STEP ===== */
  function getSlideStep() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(slider).columnGap) || 28;
    return cardWidth + gap;
  }

  /* ===== BUILD DOTS ===== */
  function buildDots() {
    if (dotsContainer) dotsContainer.remove();

    dotsContainer = document.createElement("div");
    dotsContainer.className = "ih-testimonials-dots";
    dotsContainer.setAttribute("role", "tablist");
    dotsContainer.setAttribute("aria-label", "Testimonial navigation");

    const total = getMaxIndex() + 1;

    for (let i = 0; i < total; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "ih-testimonial-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to testimonial slide " + (i + 1));
      dot.setAttribute("aria-selected", i === currentIndex ? "true" : "false");

      if (i === currentIndex) dot.classList.add("ih-dot-active");

      dot.addEventListener("click", function () {
        goToSlide(i);
        restartAutoplay();
      });

      dotsContainer.appendChild(dot);
    }

    slider.parentNode.insertBefore(dotsContainer, slider.nextSibling);

    dotsContainer.addEventListener("mouseenter", pause);
    dotsContainer.addEventListener("mouseleave", resume);
  }

  /* ===== UPDATE DOTS ===== */
  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll(".ih-testimonial-dot");

    dots.forEach(function (dot, i) {
      const active = i === currentIndex;
      dot.classList.toggle("ih-dot-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  /* ===== GO TO SLIDE ===== */
  function goToSlide(index) {
    if (isTransitioning) return;

    const maxIndex = getMaxIndex();

    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;

    currentIndex = index;
    isTransitioning = true;

    const step = getSlideStep();
    slider.style.transform = "translateX(" + (-step * currentIndex) + "px)";

    updateDots();

    setTimeout(function () {
      isTransitioning = false;
    }, TRANSITION_DURATION);
  }

  /* ===== AUTOPLAY ===== */
  function startAutoplay() {
    if (isPaused || autoplayTimer) return;

    autoplayTimer = setInterval(function () {
      if (!isPaused && !isTransitioning) {
        goToSlide(currentIndex + 1);
      }
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function pause() {
    isPaused = true;
    stopAutoplay();
  }

  function resume() {
    isPaused = false;
    startAutoplay();
  }

  /* ===== HOVER PAUSE ===== */
  slider.addEventListener("mouseenter", pause);
  slider.addEventListener("mouseleave", resume);

  /* ===== FOCUS PAUSE ===== */
  slider.setAttribute("tabindex", "0");
  slider.addEventListener("focusin", pause);
  slider.addEventListener("focusout", resume);

  /* ===== KEYBOARD ===== */
  slider.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(currentIndex - 1);
      restartAutoplay();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(currentIndex + 1);
      restartAutoplay();
    }
  });

  /* ===== TOUCH SWIPE ===== */
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener(
    "touchstart",
    function (event) {
      touchStartX = event.changedTouches[0].screenX;
      pause();
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    function (event) {
      touchEndX = event.changedTouches[0].screenX;
      handleSwipe();
      resume();
    },
    { passive: true }
  );

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;

    if (diff > 0) {
      goToSlide(currentIndex + 1);
    } else {
      goToSlide(currentIndex - 1);
    }
  }

  /* ===== PAUSE ON TAB HIDDEN ===== */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pause();
    else resume();
  });

  /* ===== PAUSE WHEN OFF-SCREEN ===== */
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) resume();
          else pause();
        });
      },
      { threshold: 0.25 }
    );

    sectionObserver.observe(slider);
  }

  /* ===== HANDLE RESIZE ===== */
  let resizeTimer;

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
      const maxIndex = getMaxIndex();
      if (currentIndex > maxIndex) currentIndex = maxIndex;

      buildDots();

      // Reposition instantly (no animation flicker)
      slider.style.transition = "none";
      const step = getSlideStep();
      slider.style.transform = "translateX(" + (-step * currentIndex) + "px)";

      requestAnimationFrame(function () {
        slider.style.transition = "";
      });
    }, 150);
  });

  /* ===== INIT ===== */
  buildDots();
  goToSlide(0);
  startAutoplay();
})();