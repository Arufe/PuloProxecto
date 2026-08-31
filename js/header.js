// Header — estado al hacer scroll y menú móvil
(function () {
  "use strict";

  function getDictSafe() {
    return window.PP && window.PP.i18n ? window.PP.i18n.getDict() : {};
  }

  var header = document.querySelector("[data-header]");
  var menuToggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector("#main-nav");
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];

  // Recibe la posición de scroll como argumento para evitar leer
  // window.scrollY después de escrituras en el DOM (reflow forzado).
  function updateHeader(y) {
    if (!header) return;
    var scrollY = typeof y === "number" ? y : window.scrollY;
    header.classList.toggle("is-scrolled", scrollY > 24);
  }

  function closeMenu() {
    if (!menuToggle || !nav) return;
    var dict = getDictSafe();
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", dict["menu.open"] || "Abrir menú");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  function initHeader() {
    if (!menuToggle || !nav) return;

    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      var dict = getDictSafe();
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? dict["menu.open"] : dict["menu.close"]
      );
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

  function getNavLinks() {
    return navLinks;
  }

  window.PP = window.PP || {};
  window.PP.header = {
    initHeader: initHeader,
    updateHeader: updateHeader,
    closeMenu: closeMenu,
    getNavLinks: getNavLinks
  };
}());
