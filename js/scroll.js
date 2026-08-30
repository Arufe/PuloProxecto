// Scroll — animaciones de entrada y navegación activa
(function () {
  "use strict";

  var config = window.PP_CONFIG || {};

  function initReveal() {
    var revealItems = document.querySelectorAll(".reveal");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

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

  function initActiveNav() {
    var ids = config.ACTIVE_SECTION_IDS || [];
    var sections = ids
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    var navLinks = ((window.PP && window.PP.header && window.PP.header.getNavLinks()) || [])
      .filter(function (link) {
        return link.getAttribute("href").charAt(0) === "#";
      });

    if (!("IntersectionObserver" in window) || !sections.length) return;

    var activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
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

  window.PP = window.PP || {};
  window.PP.scroll = {
    initReveal: initReveal,
    initActiveNav: initActiveNav
  };
}());
