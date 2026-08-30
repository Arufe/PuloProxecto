(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js-enabled");

  var header = document.querySelector("[data-header]");
  var menuToggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector("#main-nav");
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];

  function updateHeader() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
  }

  function closeMenu() {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
      nav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  var revealItems = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px" });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  var sections = ["servicios", "programas", "proyectos", "proceso", "contacto"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var sectionLinks = navLinks.filter(function (link) {
    return link.getAttribute("href").charAt(0) === "#";
  });

  if ("IntersectionObserver" in window && sections.length) {
    var activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          if (active) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -55%", threshold: 0 });

    sections.forEach(function (section) {
      activeObserver.observe(section);
    });
  }

  var questions = document.querySelectorAll(".faq-list details");
  questions.forEach(function (question) {
    question.addEventListener("toggle", function () {
      if (!question.open) return;
      questions.forEach(function (otherQuestion) {
        if (otherQuestion !== question) otherQuestion.open = false;
      });
    });
  });
}());
